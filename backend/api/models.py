from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
        ('admin', 'Admin'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    phone = models.CharField(max_length=20, blank=True, default='')
    company_name = models.CharField(max_length=100, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    avatar_url = models.TextField(blank=True, default='')
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

class FreelancerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelancer_profile')
    title = models.CharField(max_length=100, default='Software Engineer')
    headline = models.CharField(max_length=200, blank=True, default='Senior React, PyTorch & Django Architect')
    location = models.CharField(max_length=150, blank=True, default='San Francisco, CA')
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=50.00, validators=[MinValueValidator(0.0)])
    availability_status = models.CharField(max_length=50, blank=True, default='Available for Work')
    available_hours = models.CharField(max_length=50, blank=True, default='40 hrs/week')
    years_experience = models.CharField(max_length=20, blank=True, default='7+')
    rating = models.FloatField(default=5.0, validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, validators=[MinValueValidator(0.0)])
    verified = models.BooleanField(default=False)
    skills_list = models.TextField(blank=True, default='React, Python, Django')
    avatar_url = models.TextField(blank=True, default='')
    resume_name = models.CharField(max_length=255, blank=True, default='')
    resume_url = models.TextField(blank=True, default='')
    resume_size = models.CharField(max_length=50, blank=True, default='')

    def __str__(self):
        return f"Freelancer: {self.user.username}"

class SkillCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')

    class Meta:
        verbose_name_plural = "Skill Categories"

    def __str__(self):
        return self.name

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE, related_name='skills')

    def __str__(self):
        return f"{self.name} ({self.category.name})"

class Project(models.Model):
    STATUS_CHOICES = (
        ('Open', 'Open for Bids'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200)
    category = models.ForeignKey(SkillCategory, on_delete=models.SET_NULL, null=True, blank=True)
    budget = models.CharField(max_length=50, default='$5,000')
    duration = models.CharField(max_length=50, default='3 Weeks')
    skills_required = models.CharField(max_length=200, default='React, Python')
    description = models.TextField()
    abstract = models.TextField(blank=True, default='', help_text="Executive abstract or technical implementation spec for freelancers")
    attached_file_name = models.CharField(max_length=255, blank=True, default='')
    attached_file_url = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)

    def get_progress_percentage(self):
        tasks = self.sprint_tasks.all()
        if not tasks.exists():
            if self.status == 'Completed':
                return 100
            elif self.status == 'In Progress':
                return 30
            return 0
        statuses = set(t.status for t in tasks)
        if all(s in ('Done', 'Completed') for s in statuses):
            return 100
        if 'Under Review' in statuses:
            return 60
        if 'In Progress' in statuses:
            return 30
        if any(s in ('Done', 'Completed') for s in statuses):
            return 30
        return 0

    def __str__(self):
        return f"{self.title} ({self.status})"

class SprintTask(models.Model):
    STAGE_CHOICES = (
        ('To Do', 'To Do (0%)'),
        ('In Progress', 'In Progress (30%)'),
        ('Under Review', 'Under Review (60%)'),
        ('Done', 'Done (100%)'),
    )
    title = models.CharField(max_length=250)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='sprint_tasks', null=True, blank=True)
    assignee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_sprint_tasks', null=True, blank=True)
    status = models.CharField(max_length=30, choices=STAGE_CHOICES, default='To Do')
    budget = models.CharField(max_length=50, default='$2,500')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_progress_percentage(self):
        if self.status == 'Done': return 100
        if self.status == 'Under Review': return 60
        if self.status == 'In Progress': return 30
        return 0

    def __str__(self):
        return f"Sprint Task: {self.title} [{self.status}]"

class Proposal(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending Review'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='proposals')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='proposals')
    bid_amount = models.CharField(max_length=50, default='$5,000')
    delivery_time = models.CharField(max_length=50, default='2 Weeks')
    cover_letter = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Proposal for {self.project.title} by {self.freelancer.username}"

class Contract(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Archived', 'Archived'),
        ('Terminated', 'Terminated'),
    )
    contract_id = models.CharField(max_length=50, unique=True, blank=True, default='')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    proposal = models.ForeignKey(Proposal, on_delete=models.SET_NULL, null=True, blank=True)
    proposal_id_str = models.CharField(max_length=50, blank=True, default='')
    client = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='contracts_as_client')
    client_id_str = models.CharField(max_length=50, blank=True, default='')
    client_name = models.CharField(max_length=150, blank=True, default='')
    freelancer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='contracts_as_freelancer')
    freelancer_id_str = models.CharField(max_length=50, blank=True, default='')
    freelancer_name = models.CharField(max_length=150, blank=True, default='')
    project_name = models.CharField(max_length=200, blank=True, default='')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    start_date = models.CharField(max_length=100, blank=True, default='')
    end_date = models.CharField(max_length=100, blank=True, default='')
    agreed_amount = models.CharField(max_length=50, default='$5,000')
    hourly_rate = models.CharField(max_length=50, blank=True, default='$75/hr')
    payment_type = models.CharField(max_length=50, default='Fixed Price')
    escrow_balance = models.CharField(max_length=50, default='$5,000')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Contract [{self.contract_id}] - {self.project_name} ({self.status})"

class ContractMilestone(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='milestones')
    milestone_number = models.IntegerField(default=1)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    amount = models.CharField(max_length=50, default='$2,500')
    due_date = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=50, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Milestone #{self.milestone_number}: {self.title} ({self.amount})"

class Payment(models.Model):
    TYPE_CHOICES = (
        ('Escrow Lock', 'Escrow Lock'),
        ('Milestone Release', 'Milestone Release'),
        ('Refund', 'Refund'),
    )
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    milestone_title = models.CharField(max_length=200, default='Milestone Deliverable')
    payment_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='Milestone Release')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment ${self.amount} for {self.milestone_title}"

class Review(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, null=True, blank=True)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_written')
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    project_title = models.CharField(max_length=200, blank=True, default='')
    rating = models.IntegerField(default=5)
    communication_rating = models.IntegerField(default=5)
    code_quality_rating = models.IntegerField(default=5)
    deadline_adherence_rating = models.IntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review ({self.rating}★) by {self.reviewer.username} -> {self.reviewee.username}"

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username}"

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    recipient_email = models.EmailField(default='kkabhilash30@gmail.com')
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Contact Msg from {self.name} ({self.email}) -> {self.recipient_email}"

class Notification(models.Model):
    TYPE_CHOICES = (
        ('proposal', 'Proposal Event'),
        ('hired', 'Hiring Event'),
        ('milestone', 'Milestone Event'),
        ('payment', 'Payment & Escrow Event'),
        ('project', 'Project Event'),
        ('task', 'Task & Sprint Event'),
        ('message', 'Message Event'),
        ('general', 'General Notification'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='general')
    title = models.CharField(max_length=200)
    message = models.TextField()
    project_id = models.CharField(max_length=100, blank=True, default='')
    project_name = models.CharField(max_length=200, blank=True, default='')
    related_user_id = models.CharField(max_length=100, blank=True, default='')
    related_user_name = models.CharField(max_length=200, blank=True, default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.title} for {self.user.username}"

class SavedFreelancer(models.Model):
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_freelancers')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_by_clients')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('client', 'freelancer')

    def __str__(self):
        return f"{self.client.username} saved {self.freelancer.username}"

class FreelancerPortfolio(models.Model):
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolio_projects')
    title = models.CharField(max_length=200)
    description = models.TextField()
    skills = models.CharField(max_length=200, blank=True, default='')
    project_url = models.CharField(max_length=255, blank=True, default='')
    github_url = models.CharField(max_length=255, blank=True, default='')
    image_url = models.TextField(blank=True, default='')
    completion_info = models.CharField(max_length=100, blank=True, default='Completed')
    status = models.CharField(max_length=50, default='Completed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.freelancer.username})"

class FreelancerExperience(models.Model):
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='work_experiences')
    role = models.CharField(max_length=200)
    organization = models.CharField(max_length=200)
    start_date = models.CharField(max_length=50, blank=True, default='')
    end_date = models.CharField(max_length=50, blank=True, default='')
    currently_working = models.BooleanField(default=False)
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} at {self.organization} ({self.freelancer.username})"

class FreelancerEducation(models.Model):
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='educations')
    degree = models.CharField(max_length=200)
    institution = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=200, blank=True, default='')
    start_year = models.CharField(max_length=50, blank=True, default='')
    end_year = models.CharField(max_length=50, blank=True, default='')
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.degree} from {self.institution} ({self.freelancer.username})"

class FreelancerCertification(models.Model):
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    organization = models.CharField(max_length=200)
    issue_date = models.CharField(max_length=50, blank=True, default='')
    expiry_date = models.CharField(max_length=50, blank=True, default='')
    credential_id = models.CharField(max_length=100, blank=True, default='')
    credential_url = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.organization} ({self.freelancer.username})"




