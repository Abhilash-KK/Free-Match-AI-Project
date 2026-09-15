from django.urls import path
from . import views

urlpatterns = [
    path('', views.health_check, name='api_root'),
    path('health/', views.health_check, name='health_check'),
    path('auth/register/', views.register_user, name='register_user'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/google/', views.google_auth, name='google_auth'),
    path('reviews/', views.get_reviews, name='get_reviews'),
    path('reviews/submit/', views.submit_review, name='submit_review'),
    path('contact/submit/', views.submit_contact, name='submit_contact'),
    path('projects/', views.projects_api, name='projects_api'),
    path('projects/<str:pk>/', views.project_detail_api, name='project_detail_api'),
    path('saved-freelancers/', views.saved_freelancers_api, name='saved_freelancers_api'),
    path('hire-freelancer/', views.hire_freelancer_api, name='hire_freelancer_api'),
    path('sprint-tasks/', views.sprint_tasks_api, name='sprint_tasks_api'),
    path('sprint-tasks/<int:pk>/', views.sprint_tasks_api, name='sprint_tasks_detail_api'),
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('notifications/create/', views.create_notification, name='create_notification'),
    path('notifications/<int:pk>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('notifications/<int:pk>/delete/', views.delete_notification, name='delete_notification'),
    path('notifications/<int:pk>/', views.delete_notification, name='delete_notification_direct'),
    path('notifications/read-all/', views.mark_all_read, name='mark_all_read'),
    path('notifications/clear-all/', views.clear_all_notifications, name='clear_all_notifications'),
    path('contracts/', views.get_contracts, name='get_contracts'),
    path('contracts/create/', views.create_contract, name='create_contract'),
    path('contracts/<str:pk>/status/', views.update_contract_status, name='update_contract_status'),
    path('contracts/milestones/<int:pk>/status/', views.update_milestone_status_api, name='update_milestone_status_api'),
    path('freelancer-financials/', views.freelancer_financials_api, name='freelancer_financials_api'),
    path('freelancer-financials/withdraw/', views.freelancer_financials_api, name='freelancer_financials_withdraw'),
    path('client-financials/', views.client_financials_api, name='client_financials_api'),
    path('proposals/', views.proposals_api, name='proposals_api'),
    path('messages/', views.get_messages_api, name='get_messages_api'),
    path('messages/send/', views.send_message_api, name='send_message_api'),
    path('messages/mark-read/', views.mark_messages_read_api, name='mark_messages_read_api'),

    # FREELANCER PROFILE PERSISTENCE API ROUTES
    path('user-avatar/', views.user_avatar_api, name='user_avatar_api'),
    path('freelancer-profile/', views.freelancer_profile_detail_api, name='freelancer_profile_detail_api'),
    path('freelancer-skills/', views.freelancer_skills_api, name='freelancer_skills_api'),
    path('freelancer-portfolio/', views.freelancer_portfolio_api, name='freelancer_portfolio_api'),
    path('freelancer-experience/', views.freelancer_experience_api, name='freelancer_experience_api'),
    path('freelancer-education/', views.freelancer_education_api, name='freelancer_education_api'),
    path('freelancer-certifications/', views.freelancer_certifications_api, name='freelancer_certifications_api'),
    path('freelancer-resume/', views.freelancer_resume_api, name='freelancer_resume_api'),
    # ACCOUNT DEACTIVATION & REACTIVATION ROUTES
    path('deactivation-status/', views.deactivation_status_api, name='deactivation_status_api'),
    path('deactivate-account/', views.deactivate_account_api, name='deactivate_account_api'),
    path('reactivate-account/', views.reactivate_account_api, name='reactivate_account_api'),

    # ADMIN DASHBOARD & GOVERNANCE ROUTES
    path('admin-dashboard/', views.admin_dashboard_api, name='admin_dashboard_api'),
    path('admin-dashboard/verify/', views.admin_verify_user_api, name='admin_verify_user_api'),
    path('admin-dashboard/verify-project/', views.admin_verify_project_api, name='admin_verify_project_api'),
    path('admin-dashboard/toggle-user/', views.admin_toggle_user_status_api, name='admin_toggle_user_status_api'),
    path('admin-dashboard/category/', views.admin_category_api, name='admin_category_api'),
    path('admin-dashboard/skill/', views.admin_skill_api, name='admin_skill_api'),

    # GLOBAL SEARCH ROUTE
    path('search/', views.global_search_api, name='global_search_api'),
]
