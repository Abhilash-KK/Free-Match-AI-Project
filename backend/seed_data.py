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
    admin_user, _ = User.objects.get_or_create(username='admin')
    admin_user.email = 'admin@freematch.ai'
    admin_user.first_name = 'Super'
    admin_user.last_name = 'Admin'
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.is_active = True
    admin_user.set_password('admin123')
    admin_user.save()

    admin_prof, _ = UserProfile.objects.get_or_create(user=admin_user)
    admin_prof.role = 'admin'
    admin_prof.save()

    # Client User (TechStream Corp)
    client_user, _ = User.objects.get_or_create(username='techstream')
    client_user.email = 'contact@techstream.io'
    client_user.first_name = 'TechStream'
    client_user.last_name = 'Corp'
    client_user.is_active = True
    client_user.set_password('client123')
    client_user.save()

    client_prof, _ = UserProfile.objects.get_or_create(user=client_user)
    client_prof.role = 'client'
    client_prof.company_name = 'TechStream Corp'
    client_prof.verified = True
    client_prof.save()

    # Freelancer 1 (Alex Mercer)
    alex_user, _ = User.objects.get_or_create(username='alexmercer')
    alex_user.email = 'alex.m@system.net'
    alex_user.first_name = 'Alex'
    alex_user.last_name = 'Mercer'
    alex_user.is_active = True
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
    sarah_user, _ = User.objects.get_or_create(username='sarahchen')
    sarah_user.email = 'sarah.chen@ai-labs.io'
    sarah_user.first_name = 'Sarah'
    sarah_user.last_name = 'Chen'
    sarah_user.is_active = True
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
            'budget': '₹12,000',
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
            'budget': '₹6,500',
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
            'bid_amount': '₹11,500',
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
            'agreed_amount': '₹11,500',
            'escrow_balance': '₹11,500',
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

    # 7. Seed Sprint Tasks (Kanban Board)
    from api.models import SprintTask
    SprintTask.objects.get_or_create(
        title='Setup PyTorch Model Training Cluster',
        defaults={'project': p1, 'assignee': alex_user, 'status': 'To Do', 'budget': '₹2,500'}
    )
    SprintTask.objects.get_or_create(
        title='Design D3.js Financial Chart Widgets',
        defaults={'project': p2, 'assignee': sarah_user, 'status': 'In Progress', 'budget': '₹1,800'}
    )
    SprintTask.objects.get_or_create(
        title='Restructure REST API Inference Endpoints',
        defaults={'project': p1, 'assignee': alex_user, 'status': 'Under Review', 'budget': '₹4,000'}
    )
    SprintTask.objects.get_or_create(
        title='OWASP Security Audit & Vulnerability Report',
        defaults={'project': p1, 'assignee': sarah_user, 'status': 'Done', 'budget': '₹4,200'}
    )

    print("SUCCESS: Database seeded with full marketplace authentication and sample records!")

if __name__ == '__main__':
    seed_database()
