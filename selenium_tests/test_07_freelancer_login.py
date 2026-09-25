from config import FREELANCER_EMAIL
from config import FREELANCER_PASSWORD

from conftest import login


def test_freelancer_login(driver):

    login(
        driver,
        FREELANCER_EMAIL,
        FREELANCER_PASSWORD
    )

    print(
        "\nTEST 7 PASSED - Freelancer login tested"
    )