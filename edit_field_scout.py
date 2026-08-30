import re

with open('src/components/game/practice-games/middle/FieldScoutChallenge.tsx', 'r') as f:
    content = f.read()

# 1. Update Props
content = content.replace(
    'interface Props {\n  onBack: () => void;\n  gameId?: string;\n  gameName?: string;\n  gradeLabel?: string;\n  /** Practice hub band pool; shared by 6-8 (middle) and 9-12 (high). */\n  poolGrade?: PoolGrade;\n}',
    "interface Props {\n  onBack: () => void;\n  variant?: 'middle' | 'high';\n  gameId?: string;\n  gameName?: string;\n  gradeLabel?: string;\n  /** Practice hub band pool; shared by 6-8 (middle) and 9-12 (high). */\n  poolGrade?: PoolGrade;\n}"
)

# 2. Update START_MONEY and logic
# Since budget for 'middle' is also 25,000, maybe I should make it conditional based on variant
# Or maybe the request implies 25,000 is for HIGH and MIDDLE was supposed to be something else?
# "the starting budget is 5,000 (scale per-distance scouting costs proportionally so the economy still works)"
# The existing code has START_MONEY = 25000. Let's make it dynamic.

content = content.replace(
    'const START_MONEY = 25000;',
    'const START_MONEY = (variant: string) => (variant === "high" ? 25000 : 25000); // Placeholder for if middle needs a different base, current requirement implies 25k is for high.'
)
# Actually, the user says "the starting budget is 5,000" for the HIGH variant.
# Let's adjust START_MONEY to be a function or a variable that we set based on variant.

# 3. Add variant param to component
content = content.replace(
    '  poolGrade = \'middle\',\n}: Props) {',
    "  variant = 'middle',\n  poolGrade = 'middle',\n}: Props) {"
)

# 4. Implement Scoring Logic
# "the final score is out of 3 — one point per season. The player earns the season's point if they made a good scouting decision that season"
# "Perfect play in all three seasons = 3/3."
# "Show a clear per-season breakdown and the \"X / 3\" result on the end screen."

# I will perform the manual file edit now.
