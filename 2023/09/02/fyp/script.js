function snapTo(direction, element) {
    const section = element.closest('section');
    let target;

    if (direction === 'up' && section.previousElementSibling) {
        target = section.previousElementSibling;
    } else if (direction === 'down' && section.nextElementSibling) {
        target = section.nextElementSibling;
    }

    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}
