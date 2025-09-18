import uuid

# Simple auth stub - replace with NextAuth/Clerk integration later
class AuthService:
    @staticmethod
    def get_current_user_id() -> uuid.UUID:
        # Hard-coded user ID for MVP
        # TODO: Replace with actual authentication
        return uuid.UUID("12345678-1234-5678-9012-123456789012")
    
    @staticmethod
    def authenticate_request(token: str = None) -> uuid.UUID:
        # TODO: Validate JWT token and return user ID
        return AuthService.get_current_user_id()

auth_service = AuthService()