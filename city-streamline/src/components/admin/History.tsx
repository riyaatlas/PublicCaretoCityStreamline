import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Complaint } from '@/types';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const History = () => {
  const [resolvedComplaints, setResolvedComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiClient('/admin/resolved', { method: 'GET' });
        setResolvedComplaints(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Resolved Complaints History</h2>
      
      {resolvedComplaints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No resolved complaints yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {resolvedComplaints.map((complaint) => (
            <Card key={complaint.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Complaint</CardTitle>
                    <Badge className="mt-2 bg-resolved text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Resolved
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
                    <p className="font-medium text-muted-foreground">Priority Level</p>
                    <p>{complaint.priority_level}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Priority Score</p>
                    <p>{complaint.priority_score.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Submitted</p>
                    <p>{new Date(complaint.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Resolved</p>
                    <p>{new Date(complaint.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
