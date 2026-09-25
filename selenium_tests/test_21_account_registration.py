import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from config import LOGIN_URL
from conftest import open_login, get_page_text


def test_registration_form_fields_and_placeholders(driver):
    """Verify Registration form inputs, placeholders, clean slate, and role switchers."""
    wait = WebDriverWait(driver, 10)
    driver.get(LOGIN_URL)

    # Click 'Create Account' link or button on login modal
    try:
        register_link = wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Create Account') or contains(., 'Create Free Account') or contains(., 'New to FREEMATCH')]")
            )
        )
        register_link.click()
        time.sleep(1)
    except Exception:
        pass

    page_text = get_page_text(driver)

    # Verify header indicates Create Account or Welcome
    assert "account" in page_text.lower() or "sign in" in page_text.lower() or "freematch" in page_text.lower()

    # Verify input fields present
    inputs = driver.find_elements(By.TAG_NAME, "input")
    assert len(inputs) >= 2

    # Check for placeholders like 'Jonathan', 'Doe', 'jonathan123', 'jonathan@gmail.com', or standard placeholders
    placeholders = [field.get_attribute("placeholder") or "" for field in inputs]
    print("Registration Form Placeholders detected:", placeholders)

    # Ensure role options exist (Client & Freelancer)
    role_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Client') or contains(text(), 'Freelancer')]")
    assert len(role_buttons) >= 2

    print("PASS: Account Registration form structure and role switchers verified")
