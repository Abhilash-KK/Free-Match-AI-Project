from config import CLIENT_EMAIL, CLIENT_PASSWORD

from conftest import login


def test_client_login(driver):

    # EMAIL USED:
    # config.py -> CLIENT_EMAIL

    # PASSWORD USED:
    # config.py -> CLIENT_PASSWORD

    login(
        driver,
        CLIENT_EMAIL,
        CLIENT_PASSWORD
    )

    print(
        "\nTEST 3 PASSED - Client login tested"
    )