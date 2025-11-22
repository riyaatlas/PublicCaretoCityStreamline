from sklearn.cluster import DBSCAN
import numpy as np
from models import Complaint, db

def group_and_assign_complaints(department_complaints):
    if not department_complaints:
        return {}

    department_name = department_complaints[0].department

    # 🔹 Find the highest existing group number for this department
    existing_groups = (
        db.session.query(Complaint.group_id)
        .filter(Complaint.department == department_name, Complaint.group_id.isnot(None))
        .distinct()
        .all()
    )
    existing_numbers = []
    for g in existing_groups:
        gid = g[0]
        # Extract trailing number, e.g. "Water_Supply_group_3" → 3
        try:
            n = int(gid.split("_group_")[-1])
            existing_numbers.append(n)
        except ValueError:
            continue

    next_group_start = max(existing_numbers, default=-1) + 1

    # 🔹 Perform DBSCAN grouping for the new complaints
    coords = np.array([[c.latitude, c.longitude] for c in department_complaints])
    clustering = DBSCAN(eps=0.1, min_samples=1).fit(coords)
    labels = clustering.labels_

    # 🔹 Assign unique group IDs that continue from previous
    for complaint, label in zip(department_complaints, labels):
        new_group_id = f"{department_name}_group_{next_group_start + label}"
        complaint.group_id = new_group_id
        
    db.session.commit()

    # 🔹 Build and return group data
    groups = {}
    for c in department_complaints:
        groups.setdefault(c.group_id, []).append({
        "id": c.id,
        "user_id": c.user_id,
        "description": c.description,
        "priority_score": c.priority_score,
        "priority_level": c.priority_level,
        "status": c.status,
        "latitude": c.latitude,
        "longitude": c.longitude,
    })


    return groups
