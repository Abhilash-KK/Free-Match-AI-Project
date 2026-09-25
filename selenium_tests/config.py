# ==========================================================
# FREEMATCH AI - SELENIUM TEST CONFIGURATION
# ==========================================================


# ----------------------------------------------------------
# 1. FRONTEND URL
# ----------------------------------------------------------
# CHANGE THIS if your React frontend uses another port.
#
# Example:
# http://localhost:3000
# http://localhost:5173
#
BASE_URL = "http://localhost:3000"


# ----------------------------------------------------------
# 2. LOGIN URL
# ----------------------------------------------------------
# Your current login URL
#
LOGIN_URL = f"{BASE_URL}/login"


# ----------------------------------------------------------
# 3. CLIENT ACCOUNT
# ----------------------------------------------------------
# CHANGE THESE TWO VALUES.
#
CLIENT_EMAIL = "abhilashkk123@gmail.com"
CLIENT_PASSWORD = "Abhilash@123"


# ----------------------------------------------------------
# 4. FREELANCER ACCOUNT
# ----------------------------------------------------------
# CHANGE THESE TWO VALUES.
#
FREELANCER_EMAIL = "james123@gmail.com"
FREELANCER_PASSWORD = "James@123"


# ----------------------------------------------------------
# 5. ADMIN ACCOUNT
# ----------------------------------------------------------
# CHANGE THESE TWO VALUES.
#
ADMIN_EMAIL = "admin@freematch.ai"
ADMIN_PASSWORD = "admin"


# ----------------------------------------------------------
# 6. OPTIONAL TEST PROJECT
# ----------------------------------------------------------
# Enter the name of an EXISTING project that you want
# Selenium to verify.
#
TEST_PROJECT_NAME = "AI Powered Document Analysis System"


# ----------------------------------------------------------
# 7. OPTIONAL FREELANCER
# ----------------------------------------------------------
# Enter the existing freelancer you want to verify.
#
TEST_FREELANCER_NAME = "James123@gmail.com"


# ----------------------------------------------------------
# 8. BROWSER SETTINGS
# ----------------------------------------------------------

HEADLESS = False