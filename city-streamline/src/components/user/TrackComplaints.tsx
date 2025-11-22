import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Complaint } from '@/types';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';

const TrackComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const fetchComplaints = async () => {
    try {
      const data = await apiClient('/user/track', { method: 'GET' });
      // Sort: In Progress first, then Active, then Resolved
      const sortedData = data.sort((a: Complaint, b: Complaint) => {
        const statusOrder = { 'In Progress': 0, 'Active': 1, 'Resolved': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      setComplaints(sortedData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleMarkResolved = async (complaintId: number) => {
    setResolvingId(complaintId);
    try {
      await apiClient(`/user/resolve/${complaintId}`, { method: 'POST' });
      toast.success('Complaint resolved');
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark complaint as resolved');
    } finally {
      setResolvingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <AlertCircle className="h-4 w-4" />;
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'Resolved':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-active text-white';
      case 'In Progress':
        return 'bg-progress text-white';
      case 'Resolved':
        return 'bg-resolved text-white';
      default:
        return 'bg-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Track Your Complaints</h2>
      
      {complaints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No complaints found. Raise your first complaint!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Complaint</CardTitle>
                    <Badge className={`mt-2 ${getStatusColor(complaint.status)}`}>
                      <span className="mr-1">{getStatusIcon(complaint.status)}</span>
                      {complaint.status}
                    </Badge>
                  </div>
                  <Badge variant="outline">{complaint.department}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{complaint.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Priority Score</p>
                    <p>{complaint.priority_score.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Priority Level</p>
                    <p>{complaint.priority_level}</p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="font-medium text-muted-foreground">Submitted</p>
                  <p>{new Date(complaint.created_at).toLocaleString()}</p>
                </div>

                {complaint.status === 'In Progress' && (
                  <Button
                    onClick={() => handleMarkResolved(complaint.id)}
                    disabled={resolvingId === complaint.id}
                    className="w-full bg-secondary hover:bg-secondary/90"
                  >
                    {resolvingId === complaint.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Resolved
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackComplaints;
