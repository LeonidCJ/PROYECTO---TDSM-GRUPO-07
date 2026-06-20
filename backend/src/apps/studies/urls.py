from rest_framework.routers import DefaultRouter

from .views import ModelConfigViewSet, StudyViewSet

router = DefaultRouter()
router.register(r"studies", StudyViewSet, basename="study")
router.register(r"model-configs", ModelConfigViewSet, basename="modelconfig")

urlpatterns = router.urls
