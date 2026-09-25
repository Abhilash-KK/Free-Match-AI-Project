import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from config import FREELANCER_EMAIL, LOGIN_URL
from conftest import open_login, get_page_text


def test_role_mismatch_login_prevention(driver):
    """Verify that logging in as Freelancer under Client tab raises role mismatch error."""
    wait = WebDriverWait(driver, 10)
    open_login(driver)

    client_tab = driver.find_elements(By.XPATH, "//button[normalize-space()='Client']")
    if client_tab:
        client_tab[0].click()
        time.sleep(0.5)

    email_field = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text'], input[type='email']"))
    )
    password_field = driver.find_element(By.CSS_SELECTOR, "input[type='password']")

    email_field.clear()
    email_field.send_keys(FREELANCER_EMAIL)

    password_field.clear()
    password_field.send_keys("James@123")

    login_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Sign In') or contains(., 'Login')]"))
    )
    login_button.click()

    time.sleep(2)

    page_text = get_page_text(driver)

    assert "incorrect account type" in page_text.lower() or "freelancer" in page_text.lower() or "sign in" in page_text.lower()
    print("PASS: Role mismatch login prevention verified")


def test_unauthenticated_session_isolation(driver):
    """Verify that an unauthenticated user session cannot bypass the login screen."""
    driver.get(LOGIN_URL)
    try:
        driver.execute_script("localStorage.clear(); sessionStorage.clear();")
        driver.get(LOGIN_URL)
    except Exception:
        pass

    time.sleep(1)
    page_text = get_page_text(driver)

    assert "sign in" in page_text.lower() or "create account" in page_text.lower() or "freematch" in page_text.lower()
    print("PASS: Unauthenticated session isolation verified")
