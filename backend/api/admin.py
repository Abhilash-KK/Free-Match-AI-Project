from django.contrib import admin
from .models import (
    UserProfile, FreelancerProfile, SkillCategory, Skill,
    Project, Proposal, Contract, Payment, Review, Message
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'company_name', 'verified', 'created_at')
    list_filter = ('role', 'verified')
    search_fields = ('user__username', 'user__email', 'company_name')

@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'hourly_rate', 'rating', 'total_earnings', 'verified')
    list_filter = ('verified',)
    search_fields = ('user__username', 'title')

@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'category', 'budget', 'status', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'client__username', 'description')

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('project', 'freelancer', 'bid_amount', 'delivery_time', 'status', 'submitted_at')
    list_filter = ('status',)
    search_fields = ('project__title', 'freelancer__username')

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('project', 'client', 'freelancer', 'total_amount', 'escrow_amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('project__title', 'client__username', 'freelancer__username')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('contract', 'milestone_title', 'amount', 'payment_type', 'timestamp')
    list_filter = ('payment_type',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('contract', 'reviewer', 'reviewee', 'rating', 'created_at')
    list_filter = ('rating',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'content', 'timestamp', 'is_read')
    list_filter = ('is_read',)
