document.addEventListener('DOMContentLoaded', function() {
    // Property data containing images and descriptions - Updated to match Aigetai's AI themes
    const propertyData = {
        1: {
            text: "Cinematic Visuals for Film",
            promptText: "By the water",
            smallImages: ['assets/p-1-1.jpg', 'assets/p-1-2.jpg', 'assets/p-1-3.jpg', 'assets/p-1-4.jpg', 'assets/p-1-5.jpg'],
            propertyImages: [
                'assets/p-1-1.jpg',
                'assets/p-1-2.jpg',
                'assets/p-1-3.jpg',
                'assets/p-1-4.jpg',
                'assets/p-1-5.jpg'
            ]
        },
        2: {
            text: "Interior Design Visuals",
            promptText: "Modern kitchen",
            smallImages: ['assets/p-2-1.jpg', 'assets/p-2-2.jpg', 'assets/p-2-3.jpg', 'assets/p-2-4.jpg', 'assets/p-2-5.jpg'],
            propertyImages: [
                'assets/p-2-1.jpg',
                'assets/p-2-2.jpg',
                'assets/p-2-3.jpg',
                'assets/p-2-4.jpg',
                'assets/p-2-5.jpg'
            ]
        },
        3: {
            text: "Fashion & Style Visuals",
            promptText: "Rain in desert",
            smallImages: ['assets/p-3-1.jpeg', 'assets/p-3-2.jpeg', 'assets/p-3-3.jpeg', 'assets/p-3-4.jpeg', 'assets/p-3-5.jpeg'],
            propertyImages: [
                'assets/p-3-1.jpeg',
                'assets/p-3-2.jpeg',
                'assets/p-3-3.jpeg',
                'assets/p-3-4.jpeg',
                'assets/p-3-5.jpeg'
            ]
        },
        4: {
            text: "Music & Entertainment Visuals",
            promptText: "Artist in Iceland",
            smallImages: ['assets/p-4-1.jpeg', 'assets/p-4-2.jpg', 'assets/p-4-3.jpg', 'assets/p-4-4.jpg', 'assets/p-4-5.jpg'],
            propertyImages: [
                'assets/p-4-1.jpeg',
                'assets/p-4-2.jpg',
                'assets/p-4-3.jpg',
                'assets/p-4-4.jpg',
                'assets/p-4-5.jpg'
            ]
        },
        5: {
            text: "E-commerce & Product Visuals",
            promptText: "Terrarium flowers",
            smallImages: ['assets/p-5-1.jpg', 'assets/p-5-2.jpg', 'assets/p-5-3.jpg', 'assets/p-5-4.jpg', 'assets/p-5-5.jpg'],
            propertyImages: [
                'assets/p-5-1.jpg',
                'assets/p-5-2.jpg',
                'assets/p-5-3.jpg',
                'assets/p-5-4.jpg',
                'assets/p-5-5.jpg'
            ]
        }
    };

    // Get DOM elements
    const container = document.querySelector('.container');
    const propertyRadios = document.querySelectorAll('.property-radio');
    const smallImagesContainer = document.querySelector('.small-images-container');
    const backgroundZoom = document.querySelector('.background-zoom');
    const zoomImage = document.querySelector('.zoom-image');
    const girlImage = document.querySelector('.girl-image');
    const imageRadioGroup = document.querySelector('.image-radio-group');
    const propertyImagesContainer = document.querySelector('.property-images-container');
    const scrollThreshold = 50;
    const labels = document.querySelectorAll(".image-radio-group .circular-label");
    const group = document.querySelector(".image-radio-group");
    const total = labels.length;

    // State variables
    let isCarouselVisible = false;
    let currentActiveLabel = null;
    let currentPropertyId = 3;
    let propertyImagesVisible = false;
    let currentCenterIndex = 2;
    let currentRotation = 0;
    let lastImageFullyVisible = false;
    let girlImageHidden = false;

    // Animation settings
    const maxScrollForAnimation = 2000;
    const startZ = -1500;
    const endZ = 200;
    const imageAnimationScrollRange = 1800;
    const imageAppearanceScrollGap = 800;
    let appearedImages = {};
    let nextImageIndexToAppear = 0;
    let lastScrollPosition = 0;

    // Track current animation progress (number of images shown)
    let currentImageProgress = 0;

    // Initialize text displays for all properties
    function initializeTextDisplays() {
        labels.forEach(label => {
            const propertyId = parseInt(label.getAttribute('data-property'));
            const text = propertyData[propertyId].text;
            const textDisplay = label.querySelector('.property-text-inline');
            textDisplay.textContent = text;
        });
    }





    // Initialize the application
    function init() {
        smallImagesContainer.classList.remove('visible');
        smallImagesContainer.style.display = 'none';

        backgroundZoom.classList.remove('completely-hidden');
        zoomImage.classList.add('zoomed');
        backgroundZoom.classList.add('zoomed');

        girlImage.classList.remove('scrolled');
        girlImage.classList.add('visible');

        // Set default selected property
        const defaultRadio = document.getElementById('property3');
        if (defaultRadio) {
            defaultRadio.checked = true;
            const defaultLabel = defaultRadio.parentElement;
            if (defaultLabel) {
                defaultLabel.querySelector('.small-image').classList.add('active');
                defaultLabel.classList.add('active-label');
                defaultLabel.classList.add('shifted-up');
                currentActiveLabel = defaultLabel;
            }
        }

        initializeTextDisplays();
        setupImageCarousel();
        setupScrollListener();
        
        // Initialize property images container
        propertyImagesContainer.style.display = 'none';
        propertyImagesContainer.style.pointerEvents = 'none';
        
        // Initialize carousel with default property images
        updateCarouselImages(3);
    }

    // Set up scroll event listener
    function setupScrollListener() {
        let lastScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', function() {
            lastScroll = window.scrollY;

            if (!ticking) {
                window.requestAnimationFrame(function() {
                    handleScroll(lastScroll);
                    ticking = false;
                });
                ticking = true;
            }
        });

        function handleScroll(currentScroll) {
            // Hide property images if carousel isn't visible
            if (!isCarouselVisible) {
                if (propertyImagesContainer.style.display !== 'none') {
                    propertyImagesContainer.style.display = 'none';
                }
                if (propertyImagesContainer.innerHTML !== '') {
                    propertyImagesContainer.innerHTML = '';
                    appearedImages = {};
                    nextImageIndexToAppear = 0;
                }
            }

            const scrollAfterThreshold = Math.max(0, currentScroll - scrollThreshold);

            // Show/hide carousel based on scroll position
            if (currentScroll > scrollThreshold && !isCarouselVisible) {
                showCarousel();
                propertyImagesContainer.innerHTML = '';
                propertyImagesVisible = true;
                appearedImages = {};
                nextImageIndexToAppear = 0;

                // Update page styling
                document.body.classList.add('light-background');
                document.body.classList.add('scrolled-state');
                document.querySelector('.hero-text').classList.add('hidden-text');
                document.querySelector('.hero-paragraph').classList.add('hidden-text');
                
                // Show header links when scrolled (same time as Try Now button moves to top)
                const headerLinks = document.querySelector('.header-links');
                if (headerLinks) {
                    headerLinks.style.opacity = '1';
                    headerLinks.style.pointerEvents = 'auto';
                }

            } else if (currentScroll <= scrollThreshold && isCarouselVisible) {
                hideCarousel();
                propertyImagesContainer.innerHTML = '';
                propertyImagesVisible = false;
                appearedImages = {};
                nextImageIndexToAppear = 0;

                // Revert page styling
                document.body.classList.remove('light-background');
                document.body.classList.remove('scrolled-state');
                document.querySelector('.hero-text').classList.remove('hidden-text');
                document.querySelector('.hero-paragraph').classList.remove('hidden-text');
                
                // Hide header links when not scrolled
                const headerLinks = document.querySelector('.header-links');
                if (headerLinks) {
                    headerLinks.style.opacity = '0';
                    headerLinks.style.pointerEvents = 'none';
                }
            }

            // Handle property image animations
            if (isCarouselVisible && currentScroll > scrollThreshold) {
                const imagesData = propertyData[currentPropertyId].propertyImages;
                const totalImages = imagesData.length;
                const startScrollForImages = scrollThreshold;

                const nextAppearanceThreshold = startScrollForImages + (nextImageIndexToAppear * imageAppearanceScrollGap);

                // Show next image when scrolling down
                if (currentScroll > lastScrollPosition && currentScroll >= nextAppearanceThreshold && nextImageIndexToAppear < totalImages) {
                    const indexToShow = nextImageIndexToAppear;
                    const imagePathToShow = imagesData[indexToShow];
                    const imageIdToShow = `property-${currentPropertyId}-image-${indexToShow}`;

                    if (!appearedImages[imageIdToShow]) {
                        createSinglePropertyImage(imagePathToShow, indexToShow, currentPropertyId);
                        appearedImages[imageIdToShow] = true;
                        nextImageIndexToAppear++;
                    }
                }

                // Hide last image when scrolling up
                const lastAppearedImageIndex = nextImageIndexToAppear - 1;
                if (currentScroll < lastScrollPosition && lastAppearedImageIndex >= 0) {
                    const disappearanceThreshold = startScrollForImages + (lastAppearedImageIndex * imageAppearanceScrollGap);
                    const imageIdToHide = `property-${currentPropertyId}-image-${lastAppearedImageIndex}`;
                    if (currentScroll < disappearanceThreshold && appearedImages[imageIdToHide]) {
                        const wrapperToHide = document.getElementById(imageIdToHide);
                        if(wrapperToHide) { wrapperToHide.remove(); }
                        delete appearedImages[imageIdToHide];
                        nextImageIndexToAppear--;
                    }
                }

                // Animate visible images
                for (const imageId in appearedImages) {
                     const wrapper = document.getElementById(imageId);
                     if (wrapper) {
                         const parts = imageId.split('-');
                         const index = parseInt(parts[parts.length - 1]);
                         const animationStartThreshold = startScrollForImages + (index * imageAppearanceScrollGap);

                         if (currentScroll < animationStartThreshold) {
                             wrapper.remove();
                             delete appearedImages[imageId];
                             if (index === nextImageIndexToAppear - 1) {
                                 nextImageIndexToAppear--;
                             }
                             continue;
                         }

                         const animationEndThreshold = animationStartThreshold + imageAnimationScrollRange;
                         let imageScrollProgress = Math.max(0, (currentScroll - animationStartThreshold) / imageAnimationScrollRange);
                         
                         // Stop the last image (index 4) at 110% scroll progress
                         if (index === 4 && imageScrollProgress >= 1.1) {
                             imageScrollProgress = 1.1;
                         }

                         // Grid arrangement for 5 images: 3 on first row, 2 on second row
                         const gridSpacingX = 220;
                         const gridSpacingY = 180;
                         let rowTop = [], rowBottom = [];
                         for (let i = 0; i < totalImages; i++) {
                             if (i % 2 === 0) {
                                 rowTop.push(i);
                             } else {
                                 rowBottom.push(i);
                             }
                         }
                         let targetX = 0, targetY = 0;
                         if (rowTop.includes(index)) {
                             // Top row
                             const pos = rowTop.indexOf(index);
                             const centerIndex = (rowTop.length - 1) / 2;
                             targetY = -gridSpacingY / 2;
                             targetX = (pos - centerIndex) * gridSpacingX;
                         } else {
                             // Bottom row
                             const pos = rowBottom.indexOf(index);
                             const centerIndex = (rowBottom.length - 1) / 2;
                             targetY = gridSpacingY / 2;
                             targetX = (pos - centerIndex) * gridSpacingX;
                         }
                         // Shift only the 3rd image (index 2) to the right by 200px
                         if (index === 2) {
                             targetX += 200;
                         }
                         // Shift the 2nd and 4th images (indices 1 and 3) upward by 60px
                         if (index === 1 || index === 3) {
                             targetY -= 60;
                         }
                         // Shift the entire bottom row to the left by 100px
                         if (rowBottom.includes(index)) {
                             targetX -= 100;
                         }
                         const randomX = 0;
                         const randomY = 0;
                         let translateX, translateY, translateZ, scale;
                         
                         // Special handling for the last image at 110% scroll progress
                         if (index === 4 && imageScrollProgress >= 1.1) {
                             // Use exact position specified by user
                             translateX = 242.636;
                             translateY = -99.26;
                             translateZ = 374.911;
                             scale = 0.931607;
                         } else {
                             // Normal animation for all other cases
                             translateX = randomX + (targetX - randomX) * imageScrollProgress;
                             translateY = randomY + (targetY - randomY) * imageScrollProgress;
                             translateZ = startZ + (endZ - startZ) * imageScrollProgress;

                             // Slower scale-up effect
                             const minScale = 0.7;
                             const maxScale = 1.0;
                             const scaleProgress = Math.min(1, imageScrollProgress * 0.7);
                             scale = minScale + (maxScale - minScale) * scaleProgress;
                         }

                         const dynamicZIndex = 500 + index * 10 + Math.floor(imageScrollProgress * 400);

                         wrapper.style.transform = `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) scale(${scale})`;
                         wrapper.style.zIndex = dynamicZIndex;
                         wrapper.style.opacity = 1;
                        // Increase the size of only the 5th image (index 4) by 50px
                        if (index === 4) {
                            const img = wrapper.querySelector('.property-image');
                            if (img) {
                                img.style.height = '270px';
                                img.style.width = '';
                                img.style.maxHeight = 'none';
                                img.style.maxWidth = 'none';
                            }
                            // Shift the wrapper left by 35px so the right edge stays fixed
                            const currentTransform = wrapper.style.transform || '';
                            const cleanedTransform = currentTransform.replace(/translateX\(-?\d+px\)/, '');
                            wrapper.style.transform = `translateX(-35px) ${cleanedTransform}`.trim();

                             if (imageScrollProgress >= 1.1) {
                                 if (!girlImage.classList.contains('slide-down')) {
                                     girlImage.classList.add('slide-down');
                                     console.log('[DEBUG] Girl image slide-down triggered at final position');
                                 }
                                 // Move carousel to sticky row at top
                                 const smallImagesContainer = document.querySelector('.small-images-container');
                                 const imageRadioGroup = document.querySelector('.image-radio-group');
                                 const propertyImagesContainer = document.querySelector('.property-images-container');
                                 if (smallImagesContainer && !smallImagesContainer.classList.contains('sticky-row')) {
                                     smallImagesContainer.classList.add('sticky-row');
                                 }
                                 if (imageRadioGroup && !imageRadioGroup.classList.contains('sticky-row-group')) {
                                     imageRadioGroup.classList.add('sticky-row-group');
                                 }
                                 // Shift last property image left
                                 const lastWrapper = document.getElementById(`property-${currentPropertyId}-image-4`);
                                 if (lastWrapper && !lastWrapper.classList.contains('shift-left')) {
                                     lastWrapper.classList.add('shift-left');
                                 }
                                 // Show prompt text box
                                 const promptBox = wrapper.querySelector('.prompt-text-box');
                                 if (promptBox && !promptBox.classList.contains('visible')) {
                                     promptBox.classList.add('visible');
                                 }
                                 // Hide links and heading/para
                                 const headerLinks = document.querySelector('.header-links');
                                 const imagesHeading = document.querySelector('.images-heading');
                                 const imagesParagraph = document.querySelector('.images-paragraph');
                                 if (headerLinks) headerLinks.classList.add('hide-in-transition');
                                 if (imagesHeading) imagesHeading.classList.add('hide-in-transition');
                                 if (imagesParagraph) imagesParagraph.classList.add('hide-in-transition');
                                // Show property-side-text
                                const sideText = document.querySelector('.property-side-text');
                                if (sideText) {
                                    sideText.style.display = 'block';
                                    sideText.style.opacity = '1';
                                }
                             } else {
                                 if (girlImage.classList.contains('slide-down')) {
                                     girlImage.classList.remove('slide-down');
                                     console.log('[DEBUG] Girl image slide-down removed (not at final position)');
                                 }
                                 // Remove sticky row classes
                                 const smallImagesContainer = document.querySelector('.small-images-container');
                                 const imageRadioGroup = document.querySelector('.image-radio-group');
                                 const propertyImagesContainer = document.querySelector('.property-images-container');
                                 if (smallImagesContainer && smallImagesContainer.classList.contains('sticky-row')) {
                                     smallImagesContainer.classList.remove('sticky-row');
                                 }
                                 if (imageRadioGroup && imageRadioGroup.classList.contains('sticky-row-group')) {
                                     imageRadioGroup.classList.remove('sticky-row-group');
                                 }
                                 // Remove shift from last property image
                                 const lastWrapper = document.getElementById(`property-${currentPropertyId}-image-4`);
                                 if (lastWrapper && lastWrapper.classList.contains('shift-left')) {
                                     lastWrapper.classList.remove('shift-left');
                                 }
                                 // Hide prompt text box
                                 const promptBox = wrapper.querySelector('.prompt-text-box');
                                 if (promptBox && promptBox.classList.contains('visible')) {
                                     promptBox.classList.remove('visible');
                                 }
                                 // Show links and heading/para
                                 const headerLinks = document.querySelector('.header-links');
                                 const imagesHeading = document.querySelector('.images-heading');
                                 const imagesParagraph = document.querySelector('.images-paragraph');
                                 if (headerLinks) headerLinks.classList.remove('hide-in-transition');
                                 if (imagesHeading) imagesHeading.classList.remove('hide-in-transition');
                                 if (imagesParagraph) imagesParagraph.classList.remove('hide-in-transition');
                                // Hide property-side-text
                                const sideText = document.querySelector('.property-side-text');
                                if (sideText) {
                                    sideText.style.display = 'none';
                                    sideText.style.opacity = '0';
                                }
                             }
                         } else {
                             const img = wrapper.querySelector('.property-image');
                             if (img) {
                                 img.style.height = '';
                                 img.style.width = '';
                                 img.style.maxHeight = '';
                                 img.style.maxWidth = '';
                             }
                         }
                     }
                }
            }

            const wasFullyVisible = lastImageFullyVisible;
            lastImageFullyVisible = checkLastImageFullyVisible();
            if (lastImageFullyVisible && !wasFullyVisible) {
                girlImageHidden = false; // Reset so we can trigger on next scroll
            }
            if (lastImageFullyVisible && !girlImageHidden && currentScroll > lastScrollPosition) {
                girlImageHidden = true;
                girlImage.classList.add('slide-down');
                console.log('[DEBUG] .slide-down added to girl image');
            }
            if (!lastImageFullyVisible && girlImageHidden) {
                girlImageHidden = false;
                girlImage.classList.remove('slide-down');
                console.log('[DEBUG] .slide-down removed from girl image');
            }

            lastScrollPosition = currentScroll;

            // Track current animation progress (number of images shown)
            currentImageProgress = nextImageIndexToAppear;
        }
    }

    // Create a property image element
    function createSinglePropertyImage(imagePath, index, propertyId) {
        const imageId = `property-${propertyId}-image-${index}`;
        const wrapper = document.createElement('div');
        wrapper.classList.add('property-image-wrapper');
        wrapper.id = imageId;

        const randomX = 0;
        const randomY = 0;
        wrapper.dataset.randomX = randomX;
        wrapper.dataset.randomY = randomY;

        const img = document.createElement('img');
        img.classList.add('property-image');
        img.src = imagePath;
        img.alt = `Property Image ${index + 1}`;

        wrapper.appendChild(img);

        // Add text input box for the last image (index 4)
        if (index === 4) {
            const promptBox = document.createElement('div');
            promptBox.classList.add('prompt-text-box');
            
            const promptText = document.createElement('span');
            promptText.classList.add('prompt-text');
            promptText.textContent = propertyData[propertyId].promptText;
            
            const sendButton = document.createElement('div');
            sendButton.classList.add('send-button');
            
            const sendIcon = document.createElement('div');
            sendIcon.classList.add('send-icon');
            sendIcon.innerHTML = '↑';
            
            sendButton.appendChild(sendIcon);
            promptBox.appendChild(promptText);
            promptBox.appendChild(sendButton);
            
            wrapper.appendChild(promptBox);
        }

        propertyImagesContainer.appendChild(wrapper);

        wrapper.style.transform = `translate3d(${randomX}px, ${randomY}px, ${startZ}px)`;
        wrapper.style.opacity = 0;
    }

    // Show the property carousel
    function showCarousel() {
        smallImagesContainer.style.display = 'flex';
        void smallImagesContainer.offsetWidth;
        smallImagesContainer.classList.add('visible');
        backgroundZoom.classList.add('completely-hidden');
        girlImage.classList.add('scrolled');
        smallImagesContainer.style.pointerEvents = 'auto';
        isCarouselVisible = true;

        propertyImagesContainer.style.display = 'block';
        propertyImagesContainer.style.pointerEvents = 'none';
    }

    // Hide the property carousel
    function hideCarousel() {
        smallImagesContainer.classList.remove('visible');
        backgroundZoom.classList.remove('completely-hidden');
        girlImage.classList.remove('scrolled');
        smallImagesContainer.style.pointerEvents = 'none';
        isCarouselVisible = false;
        
        propertyImagesContainer.innerHTML = '';
        propertyImagesVisible = false;
        appearedImages = {};
        nextImageIndexToAppear = 0;

        setTimeout(() => {
            if (!isCarouselVisible) {
                smallImagesContainer.style.display = 'none';
                propertyImagesContainer.style.display = 'none';
                propertyImagesContainer.innerHTML = '';
                propertyImagesVisible = false;
            }
        }, 500);
    }

    // Set up the image carousel behavior
    function setupImageCarousel() {
        const labels = document.querySelectorAll('.image-radio-group label');
        labels.forEach(label => {
            const propertyId = label.getAttribute('data-property');
            const textElement = label.querySelector('.property-text-inline');
            if (textElement && propertyData[propertyId]) {
                textElement.textContent = propertyData[propertyId].text;
            }
        });

        let currentOrder = [0, 1, 2, 3, 4];

        function rotateToMiddle(clickedPos) {
            const middleIndex = 2;
            let steps = middleIndex - clickedPos;

            function rotateArray(arr, n) {
                n = ((n % arr.length) + arr.length) % arr.length;
                return arr.slice(-n).concat(arr.slice(0, -n));
            }

            currentOrder = rotateArray(currentOrder, steps);

            labels.forEach((label, index) => {
                const newOrder = currentOrder.indexOf(index);
                label.style.order = newOrder;
            });
        }

        propertyRadios.forEach((radio, index) => {
            radio.addEventListener('change', function() {
                const clickedLabel = this.parentElement;
                const clickedImg = clickedLabel.querySelector('.small-image');
                const clickedPropertyId = parseInt(this.value);
                currentPropertyId = clickedPropertyId;

                // Update background image
                const firstImagePath = propertyData[clickedPropertyId].smallImages[0];
                if (firstImagePath) {
                    zoomImage.src = firstImagePath;
                    zoomImage.classList.remove('zoomed');
                    void zoomImage.offsetWidth;
                    zoomImage.classList.add('zoomed');
                }

                // Update carousel images for the new property
                updateCarouselImages(clickedPropertyId);
                
                // Update prompt text for the last image
                updatePromptText(clickedPropertyId);

                // Update active states
                document.querySelectorAll('.small-image').forEach(img => {
                    img.classList.remove('active');
                });
                labels.forEach(l => l.classList.remove('active-label'));
                
                clickedImg.classList.add('active');
                clickedLabel.classList.add('active-label');
                
                // Rotate to center
                const clickedPos = currentOrder.indexOf(index);
                rotateToMiddle(clickedPos);

                // Update current active label
                if (currentActiveLabel) {
                    currentActiveLabel.classList.remove('shifted-up');
                }
                currentActiveLabel = clickedLabel;

                // Reset image state
                propertyImagesContainer.innerHTML = '';
                propertyImagesVisible = true;
                appearedImages = {};
                // Start new property animation from current progress
                nextImageIndexToAppear = currentImageProgress;
                for (let i = 0; i < nextImageIndexToAppear; i++) {
                    const imagePath = propertyData[currentPropertyId].propertyImages[i];
                    createSinglePropertyImage(imagePath, i, currentPropertyId);
                    appearedImages[`property-${currentPropertyId}-image-${i}`] = true;
                }
                updateShowcaseMode();
                // Immediately update animation state for new property
                if (typeof handleScroll === 'function') {
                    handleScroll(window.scrollY);
                }
            });
            
            // Hover effects
            radio.parentElement.addEventListener('mouseenter', function() {
                if (!radio.checked) {
                    const img = this.querySelector('.small-image');
                    img.style.transform = 'scale(1.1)';
                }
            });
            
            radio.parentElement.addEventListener('mouseleave', function() {
                if (!radio.checked) {
                    const img = this.querySelector('.small-image');
                    img.style.transform = 'scale(1)';
                }
            });
        });
        
        // Set initial order
        labels.forEach((label, index) => {
            label.style.order = index;
        });
    }

    // Text display functions
    function showTextDisplay(text, label) {
        const inlineTextDisplay = label.querySelector('.property-text-inline');
        if (inlineTextDisplay) {
            inlineTextDisplay.textContent = text;
        }
    }

    function hideTextDisplay(label) {
        const inlineTextDisplay = label.querySelector('.property-text-inline');
        if (inlineTextDisplay) {
            inlineTextDisplay.textContent = '';
        }
    }

    // Update carousel images for a specific property
    function updateCarouselImages(propertyId) {
        const property = propertyData[propertyId];
        if (!property) return;

        // Get all carousel images
        const carouselImages = document.querySelectorAll('.small-image');
        
        // Update each carousel image with the corresponding property image
        carouselImages.forEach((img, index) => {
            if (property.smallImages[index]) {
                img.src = property.smallImages[index];
                img.alt = property.text + ' - Image ' + (index + 1);
            }
        });

        // Update text displays for all labels
        labels.forEach((label, index) => {
            const radio = label.previousElementSibling;
            if (radio && radio.checked) {
                showTextDisplay(property.text, label);
            } else {
                hideTextDisplay(label);
            }
        });
    }

    // Update prompt text for the last image when switching properties
    function updatePromptText(propertyId) {
        const lastImageWrapper = document.getElementById(`property-${propertyId}-image-4`);
        if (lastImageWrapper) {
            const promptBox = lastImageWrapper.querySelector('.prompt-text-box');
            if (promptBox) {
                const promptText = promptBox.querySelector('.prompt-text');
                if (promptText && propertyData[propertyId]) {
                    promptText.textContent = propertyData[propertyId].promptText;
                }
            }
        }
    }

    // Reset to initial state
    function resetToInitialState() {
        smallImagesContainer.classList.remove('visible');
        smallImagesContainer.style.display = 'none';
        smallImagesContainer.style.pointerEvents = 'none';
        isCarouselVisible = false;

        backgroundZoom.classList.remove('completely-hidden');
        backgroundZoom.classList.add('zoomed');
        zoomImage.classList.add('zoomed');
        girlImage.classList.remove('scrolled');
        girlImage.classList.add('visible');

        if(currentActiveLabel) {
            hideTextDisplay(currentActiveLabel);
            currentActiveLabel.classList.remove('active-label');
            const activeImg = currentActiveLabel.querySelector('.small-image');
            if(activeImg) activeImg.classList.remove('active');
            currentActiveLabel = null;
        }

        const defaultRadio = document.getElementById('property3');
        if(defaultRadio) {
            defaultRadio.checked = true;
            const defaultLabel = defaultRadio.parentElement;
            showTextDisplay(propertyData[3].text, defaultLabel);
            defaultLabel.classList.add('active-label');
            const defaultImg = defaultLabel.querySelector('.small-image');
            if(defaultImg) defaultImg.classList.add('active');
            currentActiveLabel = defaultLabel;
            
            // Update carousel images to default property
            updateCarouselImages(3);
        }
    }

    // Initialize the application
    init();

    // Parallax effect for Try Now button
    const tryNowButton = document.querySelector('.try-now-button');
    const buttonText = tryNowButton.querySelector('.button-text');
    const moveRange = 10;

    tryNowButton.addEventListener('mousemove', (e) => {
        const buttonRect = tryNowButton.getBoundingClientRect();
        const centerX = buttonRect.left + buttonRect.width / 2;
        const centerY = buttonRect.top + buttonRect.height / 2;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const diffX = mouseX - centerX;
        const diffY = mouseY - centerY; 

        const moveX = (diffX / buttonRect.width) * moveRange * 2;
        const moveY = (diffY / buttonRect.height) * moveRange * 2;

        buttonText.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    tryNowButton.addEventListener('mouseleave', () => {
        buttonText.style.transform = `translate(0, 0)`;
    });

    // Carousel rotation functionality
    const radioButtons = document.querySelectorAll('.small-radio-button');
    const images = document.querySelectorAll('.small-image');
    let currentOrder = [0, 1, 2, 3, 4];

    function rotateToMiddle(clickedPos) {
        const middleIndex = 2;
        let steps = middleIndex - clickedPos;

        function rotateArray(arr, n) {
            n = ((n % arr.length) + arr.length) % arr.length;
            return arr.slice(-n).concat(arr.slice(0, -n));
        }

        currentOrder = rotateArray(currentOrder, steps);
        updateDOMOrder();
    }

    function updateDOMOrder() {
        const radioContainer = document.getElementById('radioContainer');
        const imageContainer = document.getElementById('imageContainer');

        radioContainer.innerHTML = '';
        imageContainer.innerHTML = '';

        currentOrder.forEach(i => {
            radioContainer.appendChild(radioButtons[i]);
            imageContainer.appendChild(images[i]);
        });

        radioButtons[currentOrder[2]].checked = true;
    }

    radioButtons.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            const clickedPos = currentOrder.indexOf(idx);
            rotateToMiddle(clickedPos);
        });
    });

    function updateShowcaseMode() {
        const imageRadioGroup = document.querySelector('.image-radio-group');
        const body = document.body;
        const labels = Array.from(document.querySelectorAll('.image-radio-group label'));

        // Find the label with the highest order
        let rightmostLabel = labels[0];
        let maxOrder = parseInt(rightmostLabel.style.order) || 0;
        labels.forEach(label => {
            const order = parseInt(label.style.order) || 0;
            if (order > maxOrder) {
                maxOrder = order;
                rightmostLabel = label;
            }
        });

        // If the rightmost label is also the active one, activate showcase mode
        if (rightmostLabel.classList.contains('active-label')) {
            body.classList.add('showcase-mode');
            imageRadioGroup.classList.add('showcase-row');
        } else {
            body.classList.remove('showcase-mode');
            imageRadioGroup.classList.remove('showcase-row');
        }
    }

    function checkLastImageFullyVisible() {
        const lastImageWrapper = document.getElementById(`property-${currentPropertyId}-image-4`);
        if (!lastImageWrapper) return false;
        const style = window.getComputedStyle(lastImageWrapper);
        const opacity = parseFloat(style.opacity);
        const transform = style.transform;
        let zValue = null;
        if (transform && transform.startsWith('matrix3d')) {
            const values = transform.match(/matrix3d\(([^)]+)\)/)[1].split(',').map(Number);
            zValue = values[14];
        } else if (transform && transform.startsWith('matrix')) {
            zValue = 0;
        }
        return opacity > 0.95 && zValue !== null && Math.abs(zValue - endZ) < 5;
    }
});
