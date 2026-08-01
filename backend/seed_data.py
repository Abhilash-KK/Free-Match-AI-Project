import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import (
    UserProfile, FreelancerProfile, SkillCategory, Skill,
    Project, Proposal, Contract, Payment, Review, Message
)

def seed_database():
    print("Seeding FreeMatch AI Database...")

    # 1. Seed Categories
    cat_se, _ = SkillCategory.objects.get_or_create(name='Software Engineering', description='Web, Mobile & Full Stack Systems')
    cat_ui, _ = SkillCategory.objects.get_or_create(name='UI/UX & Visual Design', description='Product Design, Wireframes & UI Kits')
    cat_ai, _ = SkillCategory.objects.get_or_create(name='Data Science & AI/ML', description='Machine Learning, Neural Networks & Analytics')
    cat_sec, _ = SkillCategory.objects.get_or_create(name='Cybersecurity & Auditing', description='Penetration Testing, OWASP & Compliance')

    # 2. Seed Skills
    skills_data = [
        ('React.js', cat_se),
        ('Python Django', cat_se),
        ('PostgreSQL', cat_se),
        ('Figma Design', cat_ui),
        ('Tailwind CSS', cat_ui),
        ('PyTorch ML', cat_ai),
        ('PenTesting', cat_sec),
        ('OWASP Auditing', cat_sec)
    ]
    for s_name, cat in skills_data:
        Skill.objects.get_or_create(name=s_name, category=cat)

    # 3. Seed Users
    # Admin User
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@freematch.ai', 'first_name': 'Super', 'last_name': 'Admin', 'is_staff': True, 'is_superuser': True}
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
    admin_prof, _ = UserProfile.objects.get_or_create(user=admin_user)
    admin_prof.role = 'admin'
    admin_prof.save()

    # Client User (TechStream Corp)
    client_user, created = User.objects.get_or_create(
        username='techstream',
        defaults={'email': 'contact@techstream.io', 'first_name': 'TechStream', 'last_name': 'Corp'}
    )
    if created:
        client_user.set_password('client123')
        client_user.save()
    client_prof, _ = UserProfile.objects.get_or_create(user=client_user)
    client_prof.role = 'client'
    client_prof.company_name = 'TechStream Corp'
    client_prof.verified = True
    client_prof.save()

    # Freelancer 1 (Alex Mercer)
    alex_user, created = User.objects.get_or_create(
        username='alexmercer',
        defaults={'email': 'alex.m@system.net', 'first_name': 'Alex', 'last_name': 'Mercer'}
    )
    if created:
        alex_user.set_password('freelancer123')
        alex_user.save()
    alex_prof, _ = UserProfile.objects.get_or_create(user=alex_user)
    alex_prof.role = 'freelancer'
    alex_prof.verified = True
    alex_prof.save()
    alex_fl, _ = FreelancerProfile.objects.get_or_create(user=alex_user)
    alex_fl.title = 'Senior React & Django Architect'
    alex_fl.hourly_rate = 75.00
    alex_fl.rating = 4.9
    alex_fl.total_earnings = 28900.00
    alex_fl.verified = True
    alex_fl.skills_list = 'React.js, Python Django, PostgreSQL, Tailwind CSS'
    alex_fl.save()

    # Freelancer 2 (Sarah Chen)
    sarah_user, created = User.objects.get_or_create(
        username='sarahchen',
        defaults={'email': 'sarah.chen@ai-labs.io', 'first_name': 'Sarah', 'last_name': 'Chen'}
    )
    if created:
        sarah_user.set_password('freelancer123')
        sarah_user.save()
    sarah_prof, _ = UserProfile.objects.get_or_create(user=sarah_user)
    sarah_prof.role = 'freelancer'
    sarah_prof.verified = True
    sarah_prof.save()
    sarah_fl, _ = FreelancerProfile.objects.get_or_create(user=sarah_user)
    sarah_fl.title = 'Senior Data Scientist & ML Engineer'
    sarah_fl.hourly_rate = 85.00
    sarah_fl.rating = 5.0
    sarah_fl.total_earnings = 42000.00
    sarah_fl.verified = True
    sarah_fl.skills_list = 'PyTorch ML, Python, Data Science'
    sarah_fl.save()

    # 4. Seed Projects
    p1, _ = Project.objects.get_or_create(
        client=client_user,
        title='AI Pipeline Optimization',
        defaults={
            'category': cat_ai,
            'budget': '$12,000',
            'duration': '4 Weeks',
            'skills_required': 'Python, PyTorch ML',
            'description': 'Optimize deep learning model training pipelines and automate RESTful API inferences.',
            'status': 'In Progress'
        }
    )

    p2, _ = Project.objects.get_or_create(
        client=client_user,
        title='FinTech Data Visualization Dashboard',
        defaults={
            'category': cat_se,
            'budget': '$6,500',
            'duration': '3 Weeks',
            'skills_required': 'React.js, D3.js, Tailwind CSS',
            'description': 'Implementation of a complex data visualization dashboard for crypto asset management.',
            'status': 'Open'
        }
    )

    # 5. Seed Proposals
    prop1, _ = Proposal.objects.get_or_create(
        project=p1,
        freelancer=alex_user,
        defaults={
            'bid_amount': '$11,500',
            'delivery_time': '3 Weeks',
            'cover_letter': 'Expert in high-performance PyTorch & Django API integrations. Ready to deliver ahead of schedule.',
            'status': 'Accepted'
        }
    )

    # 6. Seed Contracts & Payments
    c1, _ = Contract.objects.get_or_create(
        project=p1,
        proposal=prop1,
        client=client_user,
        freelancer=alex_user,
        defaults={
            'total_amount': 11500.00,
            'escrow_amount': 11500.00,
            'status': 'Active'
        }
    )

    Payment.objects.get_or_create(
        contract=c1,
        milestone_title='Milestone 1: Database & Model Pipeline Setup',
        defaults={
            'amount': 4000.00,
            'payment_type': 'Milestone Release'
        }
    )

    print("SUCCESS: Database seeded with full marketplace authentication and sample records!")

if __name__ == '__main__':
    seed_database()
