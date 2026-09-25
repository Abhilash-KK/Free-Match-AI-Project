import time

import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from config import LOGIN_URL, ADMIN_EMAIL, FREELANCER_EMAIL


@pytest.fixture
def driver():

    driver = webdriver.Chrome()

    driver.maximize_window()

    yield driver

    driver.quit()


def open_login(driver):

    wait = WebDriverWait(driver, 10)

    driver.get(LOGIN_URL)

    try:
        driver.execute_script("localStorage.clear(); sessionStorage.clear();")
        driver.get(LOGIN_URL)
    except Exception:
        pass

    wait.until(
        lambda d:
        d.execute_script("return document.readyState")
        == "complete"
    )

    print("\nOpened:", driver.current_url)

    # Your application first shows
    # "Sign In to Portal" if on landing page

    try:
        sign_in_button = wait.until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "//button[contains(normalize-space(), 'Sign In to Portal')]"
                )
            )
        )
        sign_in_button.click()
        print("Clicked: Sign In to Portal")
    except Exception:
        pass


def login(driver, email, password):

    wait = WebDriverWait(driver, 10)

    open_login(driver)

    # ------------------------------------------------------
    # SELECT ROLE TAB (Client | Freelancer | Admin)
    # ------------------------------------------------------
    try:
        clean_email = email.strip().lower() if email else ""
        if clean_email == ADMIN_EMAIL.strip().lower() or "admin" in clean_email:
            target_role = "Admin"
        elif clean_email == FREELANCER_EMAIL.strip().lower() or "james" in clean_email or "freelancer" in clean_email:
            target_role = "Freelancer"
        else:
            target_role = "Client"

        role_buttons = driver.find_elements(By.XPATH, f"//button[normalize-space()='{target_role}']")
        if role_buttons:
            role_buttons[0].click()
            time.sleep(0.5)
            print(f"Selected role tab: {target_role}")
    except Exception as e:
        print(f"Role tab selection skipped/failed: {e}")

    # ------------------------------------------------------
    # PASSWORD FIELD
    # ------------------------------------------------------

    password_field = wait.until(
        EC.presence_of_element_located(
            (
                By.CSS_SELECTOR,
                "input[type='password']"
            )
        )
    )

    # ------------------------------------------------------
    # EMAIL / USER ID FIELD
    # ------------------------------------------------------

    inputs = driver.find_elements(
        By.TAG_NAME,
        "input"
    )

    email_field = None

    for field in inputs:

        if field.get_attribute("type") != "password":

            email_field = field
            break

    if email_field is None:

        raise Exception(
            "Email / User ID field not found"
        )

    print(
        "Email/User ID placeholder:",
        email_field.get_attribute("placeholder")
    )

    # ------------------------------------------------------
    # ENTER LOGIN DETAILS
    # ------------------------------------------------------

    email_field.clear()
    email_field.send_keys(email)

    password_field.clear()
    password_field.send_keys(password)

    print("Email/User ID entered")
    print("Password entered")

    # ------------------------------------------------------
    # CLICK LOGIN
    # ------------------------------------------------------

    login_button = wait.until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                "//button[contains(., 'Sign In') or contains(., 'Login')]"
            )
        )
    )

    login_button.click()

    print("Login button clicked")

    # Give React/API time to process
    time.sleep(3)

    # ------------------------------------------------------
    # DISPLAY RESULT
    # ------------------------------------------------------

    print("\n========== AFTER LOGIN ==========")

    print(
        "Current URL:",
        driver.current_url
    )

    print(
        "Page title:",
        driver.title
    )

    body = driver.find_element(
        By.TAG_NAME,
        "body"
    ).text

    print("\nPAGE CONTENT:")
    print(body[:3000])

    print(
        "========== END LOGIN ==========\n"
    )

    return body


def click_text(driver, text):

    wait = WebDriverWait(driver, 10)

    element = wait.until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                f"//*[contains(normalize-space(), '{text}')]"
            )
        )
    )

    element.click()

    time.sleep(1)

    print(
        f"Clicked: {text}"
    )


def get_page_text(driver):

    return driver.find_element(
        By.TAG_NAME,
        "body"
    ).text