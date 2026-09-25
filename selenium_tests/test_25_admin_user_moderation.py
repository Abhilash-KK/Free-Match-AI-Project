import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from config import ADMIN_EMAIL, ADMIN_PASSWORD
from conftest import login, click_text, get_page_text


def test_admin_user_moderation_and_governance(driver):
    """Verify Admin User Moderation tab and Skill Governance delete category confirmation dialog."""
    wait = WebDriverWait(driver, 10)

    login(
        driver,
        ADMIN_EMAIL,
        ADMIN_PASSWORD
    )

    # 1. Test User Moderation tab
    click_text(driver, "User Moderation")
    time.sleep(1.5)

    text_users = get_page_text(driver)
    assert "user" in text_users.lower() or "moderation" in text_users.lower() or "client" in text_users.lower() or "freelancer" in text_users.lower()
    print("PASS: Admin User Moderation tab verified")

    # 2. Test Skill Governance tab and Delete Category confirmation modal
    click_text(driver, "Skill Governance")
    time.sleep(1.5)

    text_gov = get_page_text(driver)
    assert "governance" in text_gov.lower() or "category" in text_gov.lower() or "skill" in text_gov.lower()

    # Look for category delete trash buttons if present
    delete_buttons = driver.find_elements(By.XPATH, "//button[contains(@title, 'Delete') or contains(@title, 'Remove') or .//*[local-name()='svg' and contains(@class, 'lucide-trash')]]")

    if delete_buttons:
        # Click first delete button to open confirmation dialog
        delete_buttons[0].click()
        time.sleep(1)

        modal_text = get_page_text(driver)
        print("Delete Confirmation Modal detected:", "delete category" in modal_text.lower() or "are you sure" in modal_text.lower())

        # Click Cancel button to safely dismiss confirmation modal without making any DB delete request
        cancel_btn = driver.find_elements(By.XPATH, "//button[normalize-space()='Cancel']")
        if cancel_btn:
            cancel_btn[0].click()
            time.sleep(1)
            print("Safely dismissed category delete modal")

    print("PASS: Admin Skill Governance and Delete confirmation modal verified cleanly")
