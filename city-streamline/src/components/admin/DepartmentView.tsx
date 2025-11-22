import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Complaint, ComplaintGroup, Department } from '@/types';
import { Loader2, Users, AlertCircle } from 'lucide-react';

interface DepartmentViewProps {
  department: Department;
}

const DepartmentView = ({ department }: DepartmentViewProps) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [groups, setGroups] = useState<ComplaintGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrouping, setIsGrouping] = useState(false);
  const [assigningGroup, setAssigningGroup] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      const data = await apiClient(`/admin/${department}`, { method: 'GET' });
      setComplaints(data);
      setGroups([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [department]);

  const handleGroup = async () => {
    setIsGrouping(true);
    try {
      const data = await apiClient(`/admin/group/${department}`, { method: 'POST' });
      const groupsArray: ComplaintGroup[] = Object.entries(data).map(
      ([key, complaints]) => ({
        group_id: key,
        complaints: complaints as Complaint[],
      })
    );
      setGroups(groupsArray);
      toast.success('Complaints grouped successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to group complaints');
    } finally {
      setIsGrouping(false);
    }
  };

  const handleAssignTeam = async (groupId: string) => {
    setAssigningGroup(groupId);
    try {
      await apiClient(`/admin/assign/${groupId}`, { method: 'POST' });
      toast.success('Field team assigned! Users have been notified.');
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign team');
    } finally {
      setAssigningGroup(null);
    }
  };

  const getPriorityColor = (score: number) => {
    if (score < 0.3) return 'bg-destructive text-white';
    if (score < 0.6) return 'bg-warning text-white';
    return 'bg-info text-white';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{department}</h2>
        {complaints.length > 0 && groups.length === 0 && (
          <Button onClick={handleGroup} disabled={isGrouping}>
            {isGrouping ? <Loader2 className="animate-spin" /> : 'Group Complaints'}
          </Button>
        )}
      </div>

      {complaints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No active complaints in this department</p>
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Complaint</CardTitle>
                  <Badge className={getPriorityColor(complaint.priority_score)}>
                    Score: {complaint.priority_score.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{complaint.description}</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Priority Level</p>
                    <p>{complaint.priority_level}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Priority Score</p>
                    <p>{complaint.priority_score.toFixed(2)}</p>
                  </div>
                  <Badge variant="outline">{complaint.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {groups.map((group, index) => (
            <Card key={group.group_id} className="border-primary/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Group {index + 1}</CardTitle>
                  <Button
                    onClick={() => handleAssignTeam(group.group_id)}
                    disabled={assigningGroup === group.group_id}
                    size="sm"
                  >
                    {assigningGroup === group.group_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Assign Team
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {group.complaints.length} complaints in this area
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="p-3 border border-border rounded-md bg-card/50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Complaint</span>
                      <Badge className={getPriorityColor(complaint.priority_score)}>
                        {complaint.priority_score.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{complaint.description}</p>
                    <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
                      <span>Level: {complaint.priority_level}</span>
                      <span>Score: {complaint.priority_score.toFixed(2)}</span>
                      <Badge variant="outline" className="text-xs">{complaint.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentView;
