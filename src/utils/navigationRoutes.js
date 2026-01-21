// Navigation routes configuration with keywords for search matching
export const navigationRoutes = {
  // Static pages
  pages: [
    {
      keywords: ['home', 'homepage', 'main page', 'landing'],
      path: '/',
      label: 'Home',
      icon: 'bi-house'
    },
    {
      keywords: ['products', 'product', 'shop', 'store', 'items', 'catalog', 'browse products', 'all products', 'product list'],
      path: '/products',
      label: 'Products',
      icon: 'bi-box'
    },
    {
      keywords: ['services', 'service', 'our services', 'what we do', 'welding services'],
      path: '/services',
      label: 'Services',
      icon: 'bi-tools'
    },
    {
      keywords: ['cart', 'shopping cart', 'basket', 'my cart', 'view cart'],
      path: '/cart',
      label: 'Shopping Cart',
      icon: 'bi-cart',
      requiresAuth: true
    },
    {
      keywords: ['checkout', 'check out', 'place order', 'buy now', 'purchase'],
      path: '/checkout',
      label: 'Checkout',
      icon: 'bi-credit-card',
      requiresAuth: true
    },
    {
      keywords: ['profile', 'my profile', 'account', 'my account', 'user profile'],
      path: '/profile',
      label: 'My Profile',
      icon: 'bi-person',
      requiresAuth: true
    },
    {
      keywords: ['contact', 'contact us', 'get in touch', 'reach us', 'contact page'],
      path: '/contactus',
      label: 'Contact Us',
      icon: 'bi-envelope'
    },
    {
      keywords: ['about', 'about us', 'about smartweld', 'who we are'],
      path: '/aboutus',
      label: 'About Us',
      icon: 'bi-info-circle'
    },
    {
      keywords: ['custom order', 'custom product', 'order custom', 'custom welding', 'custom service'],
      path: '/custom-product-order',
      label: 'Custom Product Order',
      icon: 'bi-gear'
    },
    {
      keywords: ['login', 'sign in', 'log in', 'signin'],
      path: '/login',
      label: 'Login',
      icon: 'bi-box-arrow-in-right'
    }
  ],
  
  // Product categories (for filtering on products page)
  categories: [
    {
      keywords: ['welding equipment', 'welding tools', 'welder', 'welding machine'],
      category: 'Welding Equipment',
      path: '/products'
    },
    {
      keywords: ['safety', 'safety gear', 'protective equipment'],
      category: 'Safety Equipment',
      path: '/products'
    },
    {
      keywords: ['accessories', 'accessory'],
      category: 'Accessories',
      path: '/products'
    }
  ]
};

/**
 * Search for navigation route based on user query
 * @param {string} query - User's search query
 * @param {Array} products - List of products (optional, for product name matching)
 * @returns {Object|null} - Matching route object or null
 */
export const findNavigationRoute = (query, products = []) => {
  if (!query || typeof query !== 'string') return null;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // First, try to match a specific product by name
  if (products && products.length > 0) {
    const productMatch = products.find(product => {
      const productName = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      
      // Check if query contains product name or category
      return normalizedQuery.includes(productName) || 
             productName.includes(normalizedQuery) ||
             normalizedQuery.includes(category);
    });
    
    if (productMatch && productMatch.id) {
      return {
        path: `/product/${productMatch.id}`,
        label: productMatch.name,
        icon: 'bi-box',
        type: 'product'
      };
    }
  }
  
  // Search through static pages
  for (const page of navigationRoutes.pages) {
    for (const keyword of page.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase()) || 
          keyword.toLowerCase().includes(normalizedQuery)) {
        return {
          ...page,
          type: 'page'
        };
      }
    }
  }
  
  // Search through categories
  for (const category of navigationRoutes.categories) {
    for (const keyword of category.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        return {
          ...category,
          type: 'category',
          path: `${category.path}?category=${encodeURIComponent(category.category)}`
        };
      }
    }
  }
  
  return null;
};

/**
 * Extract navigation intent from AI response or user message
 * @param {string} message - Message text
 * @param {Array} products - List of products (optional)
 * @returns {Object|null} - Navigation route or null
 */
export const extractNavigationIntent = (message, products = []) => {
  if (!message) return null;
  
  // Common navigation phrases
  const navigationPhrases = [
    'go to', 'navigate to', 'take me to', 'show me', 'open', 'visit',
    'where can i find', 'where is', 'where to find', 'how to get to',
    'i want to see', 'i want to view', 'i want to go', 'show',
    'find', 'search for', 'look for', 'browse', 'see', 'want to',
    'can i see', 'can i view', 'can i go', 'can you show', 'can you take'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // Check if message contains navigation intent
  const hasNavigationIntent = navigationPhrases.some(phrase => 
    lowerMessage.includes(phrase)
  );
  
  if (hasNavigationIntent) {
    return findNavigationRoute(message, products);
  }
  
  // Also check for direct keyword matches (even without navigation phrases)
  const directMatch = findNavigationRoute(message, products);
  if (directMatch) {
    return directMatch;
  }
  
  return null;
};
