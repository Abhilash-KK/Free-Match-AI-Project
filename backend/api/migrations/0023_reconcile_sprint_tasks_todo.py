# Generated data migration to ensure all unstarted sprint tasks start in To-Do (0%)
from django.db import migrations

def reconcile_sprint_tasks_to_do(apps, schema_editor):
    Contract = apps.get_model('api', 'Contract')
    SprintTask = apps.get_model('api', 'SprintTask')
    Payment = apps.get_model('api', 'Payment')

    for c in Contract.objects.exclude(status__in=['Cancelled', 'Archived', 'Terminated', 'Completed']):
        cms = list(c.milestones.all().order_by('milestone_number'))
        prev_paid = True
        for idx, cm in enumerate(cms):
            cm_st = (cm.status or '').strip().lower()
            is_paid = cm_st in ['paid', 'approved', 'completed'] or Payment.objects.filter(contract=c, milestone_title__icontains=cm.title).exists()
            is_under_review = cm_st in ['submitted for review', 'under review', 'in review', 'review']

            if not is_paid and not is_under_review:
                st = SprintTask.objects.filter(milestone=cm).first()
                if not st and c.project:
                    st = SprintTask.objects.filter(project=c.project, title__iexact=cm.title).first()

                if cm_st in ['in progress', 'doing', 'active', 'pending', 'to do', 'to_do', '']:
                    if st and st.status in ['Under Review', 'Done']:
                        pass
                    else:
                        cm.status = 'Pending'
                        cm.save(update_fields=['status'])
                        if st:
                            st.status = 'To Do'
                            st.is_locked = not prev_paid
                            st.save(update_fields=['status', 'is_locked'])

            if not is_paid:
                prev_paid = False

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0022_sync_contract_completion'),
    ]

    operations = [
        migrations.RunPython(reconcile_sprint_tasks_to_do, migrations.RunPython.noop),
    ]
