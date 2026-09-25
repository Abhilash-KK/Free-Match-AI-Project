from django.contrib import admin
from django.utils.html import format_html
from .models import (
    UserProfile,
    FreelancerProfile,
    SkillCategory,
    Skill,
    Project,
    SprintTask,
    Proposal,
    Contract,
    ContractMilestone,
    Payment,
    Review,
    Message,
    ContactMessage,
    Notification,
    SavedFreelancer,
    FreelancerPortfolio,
    FreelancerExperience,
    FreelancerEducation,
    FreelancerCertification,
    FreelancerWithdrawal,
)

# Custom Admin Site Branding
admin.site.site_header = "FreeMatch AI Enterprise Administration"
admin.site.site_title = "FreeMatch AI Portal"
admin.site.index_title = "Platform Operations & Marketplace Oversight"

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'role', 'company_name', 'phone', 
        'verified', 'verification_status', 'is_deactivated', 
        'deactivation_period', 'created_at'
    )
    list_filter = ('role', 'verified', 'verification_status', 'is_deactivated')
    search_fields = ('user__username', 'user__email', 'company_name', 'phone', 'bio')
    ordering = ('-created_at',)

@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'title', 'hourly_rate', 'rating', 
        'total_earnings', 'verified', 'verification_status', 'availability_status'
    )
    list_filter = ('verified', 'verification_status', 'availability_status')
    search_fields = ('user__username', 'user__email', 'title', 'headline', 'skills_list', 'location')
    ordering = ('-user__date_joined',)

@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'skills_count', 'projects_count')
    search_fields = ('name', 'description')
    ordering = ('name',)

    def skills_count(self, obj):
        return obj.skills.count()
    skills_count.short_description = "Skills Count"

    def projects_count(self, obj):
        from .models import Project
        return Project.objects.filter(category=obj).count()
    projects_count.short_description = "Projects Count"

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category')
    list_filter = ('category',)
    search_fields = ('name', 'category__name')
    ordering = ('name',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'client', 'category', 'budget', 'duration', 
        'status', 'approval_status', 'has_abstract', 'created_at'
    )
    list_filter = ('status', 'approval_status', 'category')
    search_fields = ('title', 'client__username', 'client__email', 'description', 'skills_required', 'abstract')
    ordering = ('-created_at',)

    def has_abstract(self, obj):
        return bool(obj.abstract or obj.attached_file_name)
    has_abstract.boolean = True
    has_abstract.short_description = "Has Tech Abstract"

@admin.register(SprintTask)
class SprintTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'assignee', 'status', 'stage_badge', 'budget', 'created_at')
    list_filter = ('status',)
    search_fields = ('title', 'project__title', 'assignee__username', 'assignee__email')
    ordering = ('-created_at',)

    def stage_badge(self, obj):
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
    search_fields = ('project__title', 'freelancer__username', 'freelancer__email', 'cover_letter')
    ordering = ('-submitted_at',)

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = (
        'contract_id', 'project_name', 'client_name', 'freelancer_name', 
        'agreed_amount', 'escrow_balance', 'payment_type', 'status', 'created_at'
    )
    list_filter = ('status', 'payment_type')
    search_fields = ('contract_id', 'project_name', 'client_name', 'freelancer_name', 'client__username', 'freelancer__username')
    ordering = ('-created_at',)

@admin.register(ContractMilestone)
class ContractMilestoneAdmin(admin.ModelAdmin):
    list_display = ('contract', 'milestone_number', 'title', 'amount', 'due_date', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('title', 'contract__contract_id', 'contract__project_name', 'description')
    ordering = ('contract', 'milestone_number')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'contract', 'milestone_title', 'amount', 'payment_type', 'timestamp')
    list_filter = ('payment_type',)
    search_fields = ('contract__contract_id', 'contract__project_name', 'milestone_title')
    ordering = ('-timestamp',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer', 'reviewee', 'project_title', 'overall_rating', 'comm_rating', 'code_rating', 'deadline_rating', 'created_at')
    list_filter = ('rating', 'communication_rating', 'code_quality_rating', 'deadline_adherence_rating')
    search_fields = ('reviewer__username', 'reviewee__username', 'project_title', 'comment')
    ordering = ('-created_at',)

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
    list_display = ('sender', 'receiver', 'content_snippet', 'timestamp', 'is_read')
    list_filter = ('is_read',)
    search_fields = ('sender__username', 'receiver__username', 'content')
    ordering = ('-timestamp',)

    def content_snippet(self, obj):
        return obj.content[:60] + ('...' if len(obj.content) > 60 else '')
    content_snippet.short_description = "Message Snippet"

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'recipient_email', 'submitted_at')
    search_fields = ('name', 'email', 'subject', 'message', 'recipient_email')
    ordering = ('-submitted_at',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'title', 'related_user_name', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('user__username', 'user__email', 'title', 'message', 'project_name')
    ordering = ('-created_at',)

@admin.register(SavedFreelancer)
class SavedFreelancerAdmin(admin.ModelAdmin):
    list_display = ('client', 'freelancer', 'saved_at')
    search_fields = ('client__username', 'freelancer__username')
    ordering = ('-saved_at',)

@admin.register(FreelancerPortfolio)
class FreelancerPortfolioAdmin(admin.ModelAdmin):
    list_display = ('title', 'freelancer', 'status', 'completion_info', 'created_at')
    list_filter = ('status',)
    search_fields = ('title', 'freelancer__username', 'skills', 'description')
    ordering = ('-created_at',)

@admin.register(FreelancerExperience)
class FreelancerExperienceAdmin(admin.ModelAdmin):
    list_display = ('role', 'organization', 'freelancer', 'start_date', 'end_date', 'currently_working', 'created_at')
    list_filter = ('currently_working',)
    search_fields = ('role', 'organization', 'freelancer__username', 'description')
    ordering = ('-created_at',)

@admin.register(FreelancerEducation)
class FreelancerEducationAdmin(admin.ModelAdmin):
    list_display = ('degree', 'institution', 'freelancer', 'field_of_study', 'start_year', 'end_year', 'created_at')
    search_fields = ('degree', 'institution', 'freelancer__username', 'field_of_study')
    ordering = ('-created_at',)

@admin.register(FreelancerCertification)
class FreelancerCertificationAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'freelancer', 'issue_date', 'credential_id', 'created_at')
    search_fields = ('name', 'organization', 'freelancer__username', 'credential_id')
    ordering = ('-created_at',)

@admin.register(FreelancerWithdrawal)
class FreelancerWithdrawalAdmin(admin.ModelAdmin):
    list_display = ('freelancer', 'amount', 'bank_account', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('freelancer__username', 'bank_account')
    ordering = ('-created_at',)
