def format_inr(amount: float) -> str:
    """Formats a number in Indian Rupee format (e.g. 28450 -> ₹28,450, 125000 -> ₹1,25,000)."""
    if amount is None:
        return "₹0"
    
    amount_int = int(round(amount))
    s = str(amount_int)
    
    if len(s) <= 3:
        return f"₹{s}"
    
    last_three = s[-3:]
    remaining = s[:-3]
    
    # In Indian numbering, commas are placed every 2 digits before the last 3 digits
    parts = []
    while len(remaining) > 2:
        parts.insert(0, remaining[-2:])
        remaining = remaining[:-2]
    
    if remaining:
        parts.insert(0, remaining)
    
    formatted = ",".join(parts) + "," + last_three
    return f"₹{formatted}"
