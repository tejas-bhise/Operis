"""
Parses and formats action suggestions from Gemini LLM output.
Provides clean list of actionable items for dashboard display.
"""


def parse_actions(actions_text: str) -> list[str]:
    """
    Parses newline-separated actions string from LLM response.
    Strips numbering, bullets, and whitespace. Returns clean list.
    """
    if not actions_text:
        return []
    lines = actions_text.strip().split("\n")
    cleaned = [line.strip().lstrip("•-–—0123456789. )") for line in lines]
    return [line for line in cleaned if len(line) > 8]