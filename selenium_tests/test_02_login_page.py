from selenium.webdriver.common.by import By

from conftest import open_login


def test_login_page(driver):

    open_login(driver)

    inputs = driver.find_elements(
        By.TAG_NAME,
        "input"
    )

    print(
        "\nNumber of input fields:",
        len(inputs)
    )

    assert len(inputs) >= 2

    for i, field in enumerate(inputs):

        print(f"\nInput {i + 1}")

        print(
            "Type:",
            field.get_attribute("type")
        )

        print(
            "Placeholder:",
            field.get_attribute("placeholder")
        )

    print(
        "\nTEST 2 PASSED - Login page detected"
    )