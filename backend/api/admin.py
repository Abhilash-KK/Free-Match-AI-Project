from django.contrib import admin
from django.utils.html import format_html
from .models import (
    UserProfile, FreelancerProfile, SkillCategory, Skill,
    Project, SprintTask, Proposal, Contract, Payment, Review, Message
)

# Custom Admin Site Branding
admin.site.site_header = "FreeMatch AI Enterprise Administration"
admin.site.site_title = "FreeMatch AI Portal"
admin.site.index_title = "Platform Operations & Marketplace Oversight"

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'company_name', 'phone', 'verified', 'created_at')
    list_filter = ('role', 'verified')
    search_fields = ('user__username', 'user__email', 'company_name')

@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'hourly_rate', 'rating', 'total_earnings', 'verified')
    list_filter = ('verified',)
    search_fields = ('user__username', 'title', 'skills_list')

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
    list_display = ('title', 'client', 'category', 'budget', 'duration', 'has_abstract', 'status', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'client__username', 'description', 'abstract')

    def has_abstract(self, obj):
        return bool(obj.abstract or obj.attached_file_name)
    has_abstract.boolean = True
    has_abstract.short_description = "Has Tech Abstract"

@admin.register(SprintTask)
class SprintTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'assignee', 'stage_badge', 'budget', 'created_at')
    list_filter = ('status',)
    search_fields = ('title', 'project__title', 'assignee__username')

    def stage_badge(self, obj):
        color = 'slate'
        if obj.status == 'Done': color = 'emerald'
        elif obj.status == 'Under Review': color = 'amber'
        elif obj.status == 'In Progress': color = 'blue'
        pct = obj.get_progress_percentage()
        return format_html(
            '<span style="background-color: #0f172a; color: #38bdf8; padding: 4px 8px; border-radius: 8px; font-weight: bold; font-size: 11px;">{} ({}%)</span>',
            obj.status, pct
        )
    stage_badge.short_description = "Sprint Stage & %"

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('project', 'freelancer', 'bid_amount', 'delivery_time', 'status', 'submitted_at')
    list_filter = ('status',)
    search_fields = ('project__title', 'freelancer__username', 'cover_letter')

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('project', 'client', 'freelancer', 'total_amount', 'escrow_amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('project__title', 'client__username', 'freelancer__username')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('contract', 'milestone_title', 'amount', 'payment_type', 'timestamp')
    list_filter = ('payment_type',)
    search_fields = ('contract__project__title', 'milestone_title')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer', 'reviewee', 'project_title', 'overall_rating', 'comm_rating', 'code_rating', 'deadline_rating', 'created_at')
    list_filter = ('rating', 'communication_rating', 'code_quality_rating', 'deadline_adherence_rating')
    search_fields = ('reviewer__username', 'reviewee__username', 'project_title', 'comment')

    def overall_rating(self, obj):
        return f"★ {obj.rating}/5"
    overall_rating.short_description = "Score"

    def comm_rating(self, obj):
        return f"{obj.communication_rating}★"
    comm_rating.short_description = "Comm"

    def code_rating(self, obj):
        return f"{obj.code_quality_rating}★"
    code_rating.short_description = "Code"

    def deadline_rating(self, obj):
        return f"{obj.deadline_adherence_rating}★"
    deadline_rating.short_description = "Deadline"

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'content', 'timestamp', 'is_read')
    list_filter = ('is_read',)
    search_fields = ('sender__username', 'receiver__username', 'content')
