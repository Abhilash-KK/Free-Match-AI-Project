import re

with open('frontend/src/components/KanbanBoard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove states
text = re.sub(r'const \[showAddTaskModal.*?\n.*?\n.*?\n.*?\n.*?\n.*?isSubmittingTask.*?;\n', '', text, flags=re.MULTILINE)

# Remove functions
# handleOpenAddTaskModal and handleSaveNewTask
text = re.sub(r'const handleOpenAddTaskModal = \(\) => \{[\s\S]*?const handleSaveNewTask = async \(e\) => \{[\s\S]*?setToast\(\{ message: \'Task created successfully.*?\} catch \(err\) \{.*?\}\n  \};\n', '', text)

# Remove 'Add Sprint Task' top button
text = re.sub(r'\{\s*role === \'client\' && \(\s*<button\s*onClick=\{handleOpenAddTaskModal\}\s*className=\"[^\"]*\"\s*>\s*<Plus[^>]*/>\s*<span>Add Sprint Task</span>\s*</button>\s*\)\}', '', text)

# Remove column 'Add Task' buttons
text = re.sub(r'\{\s*role === \'client\' && \(\s*<button\s*onClick=\{handleOpenAddTaskModal\}[\s\S]*?<span>Add Task</span>\s*</button>\s*\)\}', '', text)

# Remove Modal UI (The modal appears near the end of the file, starting with {showAddTaskModal && ( )
text = re.sub(r'\{\s*showAddTaskModal && \([\s\S]*?\}\)\}\s*</div>\s*\);\s*};\s*export default KanbanBoard;', '</div>\n  );\n};\n\nexport default KanbanBoard;', text)

with open('frontend/src/components/KanbanBoard.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done!')
