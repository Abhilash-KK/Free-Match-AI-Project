import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import SprintTask, ContractMilestone, Payment, Project

def cleanup_manual_sprint_tasks():
    # Find all milestones created via the Add Sprint Task feature
    milestones = ContractMilestone.objects.filter(description__startswith='Sprint deliverable task:')
    print(f"Found {milestones.count()} extra milestones to clean up.")

    deleted_payments = 0
    deleted_sprint_tasks = 0
    deleted_milestones = 0

    for m in milestones:
        # Delete associated payments
        payments = Payment.objects.filter(contract=m.contract, milestone_title=m.title)
        payment_count = payments.count()
        if payment_count > 0:
            payments.delete()
            deleted_payments += payment_count
        
        # Adjust freelancer earnings and escrow if necessary (the instructions say "Remove the payment records/payments generated from these added sprint tasks as well... so they do not appear in... Transaction history... Do not delete legitimate project/milestone payments").
        # If we delete the payment and milestone, client_financials_api and update_milestone_status_api recalculations will be accurate.
        # But wait! update_milestone_status_api modifies contract.escrow_balance and freelancer total_earnings.
        # Let's revert earnings and escrow.
        
        import re
        from decimal import Decimal
        m_amt_digits = re.sub(r'[^0-9.]', '', str(m.amount or '0'))
        m_num = Decimal(m_amt_digits if m_amt_digits else '0')

        if m.status.lower() in ['paid', 'approved'] and m_num > 0:
            if m.contract and m.contract.freelancer:
                profile = m.contract.freelancer.profile
                profile.total_earnings = max(Decimal('0'), Decimal(str(profile.total_earnings or '0')) - m_num)
                profile.save()
            
            # Since the milestone is deleted, it wasn't part of the original agreed amount. Wait! 
            # When the task was created, the milestone was added. The escrow wasn't actually increased for this extra task?
            # Actually, `sprint_tasks_api` POST doesn't increase contract's `agreed_amount` or `escrow_balance`.
            # When paid, `escrow_balance = max(0, escrow - m_num)` happened.
            # We should restore the escrow_balance by adding m_num back, up to agreed_amount.
            if m.contract:
                c_escrow_digits = re.sub(r'[^0-9.]', '', str(m.contract.escrow_balance or m.contract.agreed_amount or '0'))
                c_escrow_num = Decimal(c_escrow_digits if c_escrow_digits else '0')
                new_escrow = c_escrow_num + m_num
                
                c_agreed_digits = re.sub(r'[^0-9.]', '', str(m.contract.agreed_amount or '0'))
                c_agreed_num = Decimal(c_agreed_digits if c_agreed_digits else '0')
                
                m.contract.escrow_balance = f"₹{int(min(new_escrow, c_agreed_num)):,}"
                
                # Revert contract status if it was completed by this task?
                if m.contract.status == 'Completed':
                    m.contract.status = 'Active'
                    if m.contract.project:
                        m.contract.project.status = 'In Progress'
                        m.contract.project.save()
                m.contract.save()

        # Delete associated sprint tasks
        st = SprintTask.objects.filter(milestone=m)
        if st.exists():
            deleted_sprint_tasks += st.count()
            st.delete()
        else:
            st2 = SprintTask.objects.filter(title=m.title, project=m.contract.project)
            if st2.exists():
                deleted_sprint_tasks += st2.count()
                st2.delete()
        
        # Finally delete milestone
        m.delete()
        deleted_milestones += 1

    # What if there are SprintTasks created without ContractMilestone?
    # Let's find SprintTasks whose titles look like "Resume Parser & Vector Matcher 1791367535"
    # Actually, those titles were just tests. The user says: "Remove the currently added/extra sprint tasks that were created through this Sprint Task feature."
    # If the feature created them, they are definitely in the DB with the description `Sprint deliverable task: {title}`.
    
    print(f"Cleaned up {deleted_milestones} milestones, {deleted_sprint_tasks} sprint tasks, and {deleted_payments} payment records.")

if __name__ == '__main__':
    cleanup_manual_sprint_tasks()
