function toggleQuestion(element) {
    const content = element.nextElementSibling;
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
}

function runCode(button) {
    const codeContent = button.previousElementSibling.querySelector('.code-input').value;
    const outputWindow = button.nextElementSibling;
    
    // In a real implementation, you'd need a backend server to execute Python code
    // This is just a simulation
    outputWindow.textContent = "Output will appear here\nNote: Actual Python execution requires backend integration";
}

function copyCode(button) {
    const codeBlock = button.closest('.code-window').querySelector('.code-input');
    codeBlock.select();
    document.execCommand('copy');
    
    // Visual feedback
    button.textContent = 'Copied!';
    button.classList.add('copied');
    
    // Reset button text after 2 seconds
    setTimeout(() => {
        button.textContent = 'Copy';
        button.classList.remove('copied');
    }, 2000);
}
