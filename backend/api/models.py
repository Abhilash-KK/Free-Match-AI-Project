from django.db import models
from django.contrib.auth.models import User

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
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

class FreelancerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelancer_profile')
    title = models.CharField(max_length=100, default='Software Engineer')
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=50.00)
    rating = models.FloatField(default=5.0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    verified = models.BooleanField(default=False)
    skills_list = models.TextField(blank=True, default='React, Python, Django')

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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

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
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contracts_as_client')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contracts_as_freelancer')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=5000.00)
    escrow_amount = models.DecimalField(max_digits=10, decimal_places=2, default=5000.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Contract: {self.project.title}"

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
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_written')
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review ({self.rating}★) by {self.reviewer.username}"

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username}"
