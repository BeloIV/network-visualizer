from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'devices', views.DeviceViewSet)
router.register(r'connections', views.ConnectionViewSet)
router.register(r'configuration-files', views.ConfigurationFileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
