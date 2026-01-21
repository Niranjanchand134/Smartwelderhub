import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const LandingPage = () => {
    const { t } = useTranslation();
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    
    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };
    
    const faqData = [
        {
            question: 'What services does SmartWeld offer?',
            answer: 'SmartWeld offers a comprehensive range of welding services including metal works, steel welding, pipe welding, and custom welding solutions. We also provide custom product design and manufacturing services tailored to your specific needs.'
        },
        {
            question: 'How do I place a custom order?',
            answer: 'You can place a custom order by visiting our Services page and filling out the custom product order form. Our team will review your requirements and provide you with an estimated cost and timeline for your project.'
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept various payment methods including cash on delivery, bank transfer, and online payment through eSewa. Payment details will be discussed during the order confirmation process.'
        },
        {
            question: 'How long does it take to complete a custom order?',
            answer: 'The completion time depends on the complexity and size of your order. Typically, custom orders take between 1-3 weeks. Our team will provide you with an estimated timeline when you place your order.'
        },
        {
            question: 'Do you provide installation services?',
            answer: 'Yes, we offer installation services for our products. Installation charges may apply depending on the location and complexity of the installation. This can be discussed during the order process.'
        },
        {
            question: 'What if I need to modify or cancel my order?',
            answer: 'Please contact us as soon as possible if you need to modify or cancel your order. Modifications may be possible before production begins, and cancellation policies depend on the order status. Our customer service team will assist you with this.'
        }
    ];
    
    return(
        <>
        {/* <!-- Carousel Start --> */}
        <div className="container-fluid p-0 mb-6 wow fadeIn" data-wow-delay="0.1s">
            <div id="header-carousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-indicators">
                    <button type="button" data-bs-target="#header-carousel" data-bs-slide-to="0" className="active"
                        aria-current="true" aria-label="Slide 1">
                        <img className="img-fluid" src="./assets/image/carousel-1.jpg" alt="Image"/>
                    </button>
                    <button type="button" data-bs-target="#header-carousel" data-bs-slide-to="1" aria-label="Slide 2">
                        <img className="img-fluid" src="./assets/image/carousel-2.jpg" alt="Image"/>
                    </button>
                    <button type="button" data-bs-target="#header-carousel" data-bs-slide-to="2" aria-label="Slide 3">
                        <img className="img-fluid" src="./assets/image/carousel-3.jpg" alt="Image"/>
                    </button>
                </div>
                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <img className="w-100" src="./assets/image/carousel-1.jpg" alt="BackgroundImage"/>
                        <div className="carousel-caption">
                            <h1 className="display-1 text-uppercase text-white mb-4 animated zoomIn">{t('landing.bestMetalcraftSolutions')}
                            </h1>
                            <a href="#" className="btn btn-primary py-3 px-4">{t('common.exploreMore')}</a>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <img className="w-100" src="./assets/image/carousel-2.jpg" alt="Image"/>
                        <div className="carousel-caption">
                            <h1 className="display-1 text-uppercase text-white mb-4 animated zoomIn">{t('landing.bestMetalcraftSolutions')}
                            </h1>
                            <a href="/aboutus" className="btn btn-primary py-3 px-4">{t('common.exploreMore')}</a>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <img className="w-100" src="./assets/image/carousel-3.jpg" alt="Image"/>
                        <div className="carousel-caption">
                            <h1 className="display-1 text-uppercase text-white mb-4 animated zoomIn">{t('landing.bestMetalcraftSolutions')}
                            </h1>
                            <a href="#" className="btn btn-primary py-3 px-4">{t('common.exploreMore')}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- Carousel End --> */}

        {/* <!-- About Start --> */}
        <div className="container-fluid pt-6 pb-6">
            <div className="container">
                <div className="row g-5">
                    <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                        <div className="about-img">
                            <img className="img-fluid w-100" src="./assets/image/about.jpg"/>
                        </div>
                    </div>
                    <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                        <h1 className="display-6 text-uppercase mb-4">{t('landing.ultimateWelding')}</h1>
                        <p className="mb-4">SmartWeld is a premier platform connecting customers with skilled professional welders and high-quality metal fabrication services. We specialize in providing comprehensive welding solutions, custom metalwork, and expert craftsmanship for all your industrial and personal needs. Our certified professionals use state-of-the-art equipment to deliver precision work that meets the highest industry standards.</p>
                        <div className="row g-5 mb-4">
                            <div className="col-sm-6">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0 btn-xl-square bg-light me-3">
                                        <i className="fa fa-users-cog fa-2x text-primary"></i>
                                    </div>
                                    <h5 className="lh-base text-uppercase mb-0">{t('landing.certifiedExpertTeam')}</h5>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0 btn-xl-square bg-light me-3">
                                        <i className="fa fa-tachometer-alt fa-2x text-primary"></i>
                                    </div>
                                    <h5 className="lh-base text-uppercase mb-0">{t('landing.fastReliableServices')}</h5>
                                </div>
                            </div>
                        </div>
                        <p><i className="fa fa-check-square text-primary me-3"></i>Certified and licensed professional welders with rigorous training
                        </p>
                        <p><i className="fa fa-check-square text-primary me-3"></i>State-of-the-art welding equipment and precision tools
                        </p>
                        <p><i className="fa fa-check-square text-primary me-3"></i>Custom solutions tailored to your specific design requirements
                        </p>
                        <div className="border border-5 border-primary p-4 text-center mt-4">
                            <h4 className="lh-base text-uppercase mb-0">{t('landing.weAreGood')}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- About End --> */}

        {/* <!-- Features Start --> */}
        <div className="container-fluid pt-6 pb-6">
            <div className="container pt-4">
                <div className="row g-0 feature-row wow fadeIn" data-wow-delay="0.1s">
                    <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.3s">
                        <div className="feature-item border h-100">
                            <div className="feature-icon btn-xxl-square bg-primary mb-4 mt-n4">
                                <i className="fa fa-hammer fa-2x text-white"></i>
                            </div>
                            <div className="p-5 pt-0">
                                <h5 className="text-uppercase mb-3">Quality Welding</h5>
                                <p>Professional welding services with precision engineering and certified expertise for all your metal fabrication needs.</p>
                                <a className="position-relative text-body text-uppercase small d-flex justify-content-between"
                                    href="/aboutus"><b className="bg-white pe-3">Read More</b> <i
                                        className="bi bi-arrow-right bg-white ps-3"></i></a>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.4s">
                        <div className="feature-item border h-100">
                            <div className="feature-icon btn-xxl-square bg-primary mb-4 mt-n4">
                                <i className="fa fa-dollar-sign fa-2x text-white"></i>
                            </div>
                            <div className="p-5 pt-0">
                                <h5 className="text-uppercase">Affordable Pricing</h5>
                                <p>Competitive pricing with transparent cost estimates and flexible payment options including eSewa and cash on delivery.</p>
                                <a className="position-relative text-body text-uppercase small d-flex justify-content-between"
                                    href="/aboutus"><b className="bg-white pe-3">Read More</b> <i
                                        className="bi bi-arrow-right bg-white ps-3"></i></a>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.5s">
                        <div className="feature-item border h-100">
                            <div className="feature-icon btn-xxl-square bg-primary mb-4 mt-n4">
                                <i className="fa fa-check-double fa-2x text-white"></i>
                            </div>
                            <div className="p-5 pt-0">
                                <h5 className="text-uppercase">Best Welder</h5>
                                <p>Connect with the most skilled and certified welders in the industry, ensuring top-quality workmanship for every project.</p>
                                <a className="position-relative text-body text-uppercase small d-flex justify-content-between"
                                    href="/aboutus"><b className="bg-white pe-3">Read More</b> <i
                                        className="bi bi-arrow-right bg-white ps-3"></i></a>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.6s">
                        <div className="feature-item border h-100">
                            <div className="feature-icon btn-xxl-square bg-primary mb-4 mt-n4">
                                <i className="fa fa-tools fa-2x text-white"></i>
                            </div>
                            <div className="p-5 pt-0">
                                <h5 className="text-uppercase">Quality Tools</h5>
                                <p>Advanced welding equipment and modern tools ensuring precision, durability, and exceptional results in every project.</p>
                                <a className="position-relative text-body text-uppercase small d-flex justify-content-between"
                                    href="/aboutus"><b className="bg-white pe-3">Read More</b> <i
                                        className="bi bi-arrow-right bg-white ps-3"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- Features End --> */}

        {/* <!-- Recent Products Start --> */}
        <div className="container-fluid pt-6 pb-6 bg-light">
            <div className="container">
                <div className="text-center mx-auto wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: "600px" }}>
                    <h1 className="display-6 text-uppercase mb-3">Recent Products</h1>
                    <div className="d-inline-flex align-items-center justify-content-center mb-4">
                        <div className="bg-primary" style={{ width: '60px', height: '3px' }}></div>
                        <i className="fas fa-star text-primary mx-3"></i>
                        <div className="bg-primary" style={{ width: '60px', height: '3px' }}></div>
                    </div>
                    <p className="mb-5">Check out our latest additions to the product catalog</p>
                </div>
                <div className="text-center mt-5">
                    <a href="/products" className="btn btn-primary py-3 px-5" style={{ borderRadius: '5px', fontWeight: '600' }}>
                        View All Products <i className="bi bi-arrow-right ms-2"></i>
                    </a>
                </div>
            </div>
        </div>
        {/* <!-- Recent Products End --> */}

        {/* <!-- Service Information Start --> */}
        <div className="container-fluid pt-6 pb-6">
            <div className="container">
                <div className="text-center mx-auto wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: "600px" }}>
                    <h1 className="display-6 text-uppercase mb-3">Our Service Portal</h1>
                    <div className="d-inline-flex align-items-center justify-content-center mb-4">
                        <div className="bg-primary" style={{ width: '60px', height: '3px' }}></div>
                        <i className="fas fa-cog text-primary mx-3 fa-spin" style={{ animationDuration: '3s' }}></i>
                        <div className="bg-primary" style={{ width: '60px', height: '3px' }}></div>
                    </div>
                    <p className="mb-5">Comprehensive welding solutions tailored to your needs</p>
                </div>
                <div className="row g-4">
                    <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                        <div className="service-item border h-100 shadow-sm" style={{ transition: 'all 0.3s ease', borderRadius: '10px', overflow: 'hidden' }}>
                            <div className="service-icon btn-xxl-square bg-primary mb-4 mt-n4" style={{ borderRadius: '10px' }}>
                                <i className="fa fa-cog fa-2x text-white"></i>
                            </div>
                            <div className="p-5 pt-0">
                                <h5 className="text-uppercase mb-3 fw-bold">Custom Design Service</h5>
                                <p className="mb-4" style={{ lineHeight: '1.8' }}>Get personalized welding solutions designed specifically for your requirements. Our expert team will work with you to create the perfect design.</p>
                                <a href="/Services" className="position-relative text-body text-uppercase small d-flex justify-content-between text-decoration-none fw-bold">
                                    <b className="bg-white pe-3">Learn More</b>
                                    <i className="bi bi-arrow-right bg-white ps-3"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.2s">
                        <div className="service-item border h-100 shadow-sm" style={{ transition: 'all 0.3s ease', borderRadius: '10px', overflow: 'hidden' }}>
                            <div className="service-icon btn-xxl-square bg-primary mb-4 mt-n4" style={{ borderRadius: '10px' }}>
                                <i className="fa fa-tools fa-2x text-white"></i>
                            </div>
                            <div className="p-5 pt-0">
                                <h5 className="text-uppercase mb-3 fw-bold">Professional Welding</h5>
                                <p className="mb-4" style={{ lineHeight: '1.8' }}>Expert welding services for all types of metal work including gates, windows, railings, and structural components with precision and quality.</p>
                                <a href="/Services" className="position-relative text-body text-uppercase small d-flex justify-content-between text-decoration-none fw-bold">
                                    <b className="bg-white pe-3">Learn More</b>
                                    <i className="bi bi-arrow-right bg-white ps-3"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
                        <div className="service-item border h-100 shadow-sm" style={{ transition: 'all 0.3s ease', borderRadius: '10px', overflow: 'hidden' }}>
                            <div className="service-icon btn-xxl-square bg-primary mb-4 mt-n4" style={{ borderRadius: '10px' }}>
                                <i className="fa fa-truck fa-2x text-white"></i>
                            </div>
                            <div className="p-5 pt-0">
                                <h5 className="text-uppercase mb-3 fw-bold">Installation & Delivery</h5>
                                <p className="mb-4" style={{ lineHeight: '1.8' }}>We provide complete installation services and reliable delivery options to ensure your products are installed correctly and on time.</p>
                                <a href="/Services" className="position-relative text-body text-uppercase small d-flex justify-content-between text-decoration-none fw-bold">
                                    <b className="bg-white pe-3">Learn More</b>
                                    <i className="bi bi-arrow-right bg-white ps-3"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mt-5">
                    <div className="col-lg-12">
                        <div className="bg-primary text-white p-5 rounded wow fadeInUp shadow-lg" data-wow-delay="0.4s" style={{ borderRadius: '10px' }}>
                            <div className="row align-items-center">
                                <div className="col-lg-8">
                                    <h3 className="text-uppercase mb-3 fw-bold">
                                        <i className="fas fa-rocket me-2"></i>
                                        Ready to Get Started?
                                    </h3>
                                    <p className="mb-0 fs-5">Visit our Services page to explore all available services and place your custom order today!</p>
                                </div>
                                <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                                    <a href="/Services" className="btn btn-light py-3 px-5 fw-bold" style={{ borderRadius: '5px' }}>
                                        Explore Services <i className="bi bi-arrow-right ms-2"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- Service Information End --> */}

        {/* <!-- FAQ Start --> */}
        <div className="container-fluid pt-6 pb-6 bg-light">
            <div className="container">
                <div className="text-center mx-auto wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: "600px" }}>
                    <h1 className="display-6 text-uppercase mb-3">Frequently Asked Questions</h1>
                    <div className="d-inline-flex align-items-center justify-content-center mb-4">
                        <div className="bg-primary" style={{ width: '60px', height: '3px' }}></div>
                        <i className="fas fa-question-circle text-primary mx-3"></i>
                        <div className="bg-primary" style={{ width: '60px', height: '3px' }}></div>
                    </div>
                    <p className="mb-5">Find answers to common questions about our services and products</p>
                </div>
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="accordion" id="faqAccordion">
                            {faqData.map((faq, index) => (
                                <div key={index} className="accordion-item mb-3 border-0 shadow-sm wow fadeInUp" data-wow-delay={`${0.1 + index * 0.1}s`} style={{ borderRadius: '10px', overflow: 'hidden' }}>
                                    <h2 className="accordion-header" id={`faqHeading${index}`}>
                                        <button
                                            className={`accordion-button ${openFaqIndex !== index ? 'collapsed' : ''} fw-bold`}
                                            type="button"
                                            onClick={() => toggleFaq(index)}
                                            aria-expanded={openFaqIndex === index}
                                            aria-controls={`faqCollapse${index}`}
                                            style={{ 
                                                backgroundColor: openFaqIndex === index ? '#ce9233' : '#fff',
                                                color: openFaqIndex === index ? '#fff' : '#000',
                                                border: 'none',
                                                borderRadius: '10px'
                                            }}
                                        >
                                            <i className={`fas fa-question-circle me-3 ${openFaqIndex === index ? 'text-white' : 'text-primary'}`}></i>
                                            {faq.question}
                                        </button>
                                    </h2>
                                    <div
                                        id={`faqCollapse${index}`}
                                        className={`accordion-collapse collapse ${openFaqIndex === index ? 'show' : ''}`}
                                        aria-labelledby={`faqHeading${index}`}
                                    >
                                        <div className="accordion-body bg-light" style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                                            <p className="mb-0">{faq.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- FAQ End --> */}
        </>
    )
}

export default LandingPage;