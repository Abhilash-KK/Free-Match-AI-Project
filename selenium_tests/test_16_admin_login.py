from config import ADMIN_EMAIL, ADMIN_PASSWORD

from conftest import login


def test_admin_login(driver):

    login(
        driver,
        ADMIN_EMAIL,
        ADMIN_PASSWORD
    )

    print(
        "\nTEST 16 PASSED - Admin login tested"
    )