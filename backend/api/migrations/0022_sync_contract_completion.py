# Generated data migration to reconcile completed contracts and projects based on actual DB milestones/tasks
from django.db import migrations

def sync_completed_contracts(apps, schema_editor):
    Contract = apps.get_model('api', 'Contract')
    Payment = apps.get_model('api', 'Payment')

    for c in Contract.objects.exclude(status__in=['Cancelled', 'Archived', 'Terminated']):
        milestones = list(c.milestones.all())
        proj = c.project
        tasks = list(proj.sprint_tasks.all()) if proj else []

        if not milestones and not tasks:
            continue

        milestones_done = True
        if milestones:
            for m in milestones:
                st = (m.status or '').strip().lower()
                is_paid = st in ['paid', 'approved', 'completed'] or Payment.objects.filter(contract=c, milestone_title__icontains=m.title).exists()
                if not is_paid:
                    milestones_done = False
                    break

        tasks_done = True
        if tasks:
            for t in tasks:
                st = (t.status or '').strip().lower()
                if st not in ['done', 'completed', 'approved']:
                    tasks_done = False
                    break

        if milestones_done and tasks_done:
            if c.status != 'Completed':
                c.status = 'Completed'
                c.save(update_fields=['status'])
            if proj and proj.status != 'Completed':
                proj.status = 'Completed'
                proj.save(update_fields=['status'])

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_alter_freelancerprofile_verification_status_and_more'),
    ]

    operations = [
        migrations.RunPython(sync_completed_contracts, migrations.RunPython.noop),
    ]
