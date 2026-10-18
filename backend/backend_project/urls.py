from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='/api/health/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Serve media files in development and production fallback
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
