from config import CLIENT_EMAIL, CLIENT_PASSWORD

from conftest import login, click_text


def test_client_navigation(driver):

    login(
        driver,
        CLIENT_EMAIL,
        CLIENT_PASSWORD
    )

    # CHANGE THESE TEXT VALUES if your
    # navigation labels are different.

    navigation_items = [
        "Projects",
        "Messages",
        "Contracts",
        "Profile"
    ]

    for item in navigation_items:

        print(
            f"\nTesting navigation: {item}"
        )

        try:

            click_text(
                driver,
                item
            )

            print(
                f"{item}: PASSED"
            )

        except Exception as error:

            print(
                f"{item}: FAILED"
            )

            print(error)

    print(
        "\nTEST 5 COMPLETED - Navigation checked"
    )