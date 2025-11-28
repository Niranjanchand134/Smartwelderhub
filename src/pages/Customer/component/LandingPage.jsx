const LandingPage = () => {
    return(
        <>
        {/* <!-- Carousel Start --> */}
        <div class="container-fluid p-0 mb-6 wow fadeIn" data-wow-delay="0.1s">
            <div id="header-carousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-indicators">
                    <button type="button" data-bs-target="#header-carousel" data-bs-slide-to="0" class="active"
                        aria-current="true" aria-label="Slide 1">
                        <img class="img-fluid" src="./assets/image/carousel-1.jpg" alt="Image"/>
                    </button>
                    <button type="button" data-bs-target="#header-carousel" data-bs-slide-to="1" aria-label="Slide 2">
                        <img class="img-fluid" src="./assets/image/carousel-2.jpg" alt="Image"/>
                    </button>
                    <button type="button" data-bs-target="#header-carousel" data-bs-slide-to="2" aria-label="Slide 3">
                        <img class="img-fluid" src="./assets/image/carousel-3.jpg" alt="Image"/>
                    </button>
                </div>
                <div class="carousel-inner">
                    <div class="carousel-item active">
                        <img class="w-100" src="./assets/image/carousel-1.jpg" alt="BackgroundImage"/>
                        <div class="carousel-caption">
                            <h1 class="display-1 text-uppercase text-white mb-4 animated zoomIn">Best Metalcraft Solutions
                            </h1>
                            <a href="#" class="btn btn-primary py-3 px-4">Explore More</a>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <img class="w-100" src="./assets/image/carousel-2.jpg" alt="Image"/>
                        <div class="carousel-caption">
                            <h1 class="display-1 text-uppercase text-white mb-4 animated zoomIn">Best Metalcraft Solutions
                            </h1>
                            <a href="#" class="btn btn-primary py-3 px-4">Explore More</a>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <img class="w-100" src="./assets/image/carousel-3.jpg" alt="Image"/>
                        <div class="carousel-caption">
                            <h1 class="display-1 text-uppercase text-white mb-4 animated zoomIn">Best Metalcraft Solutions
                            </h1>
                            <a href="#" class="btn btn-primary py-3 px-4">Explore More</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- Carousel End --> */}

        {/* <!-- About Start --> */}
        <div class="container-fluid pt-6 pb-6">
            <div class="container">
                <div class="row g-5">
                    <div class="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                        <div class="about-img">
                            <img class="img-fluid w-100" src="./assets/image/about.jpg"/>
                        </div>
                    </div>
                    <div class="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                        <h1 class="display-6 text-uppercase mb-4">Ultimate Welding and Quality Metal Solutions</h1>
                        <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue,
                            iaculis id elit eget, ultrices pulvinar tortor. Quisque vel lorem porttitor, malesuada arcu
                            quis, fringilla risus. Pellentesque eu consequat augue.</p>
                        <div class="row g-5 mb-4">
                            <div class="col-sm-6">
                                <div class="d-flex align-items-center">
                                    <div class="flex-shrink-0 btn-xl-square bg-light me-3">
                                        <i class="fa fa-users-cog fa-2x text-primary"></i>
                                    </div>
                                    <h5 class="lh-base text-uppercase mb-0">Certified Expert & Team</h5>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="d-flex align-items-center">
                                    <div class="flex-shrink-0 btn-xl-square bg-light me-3">
                                        <i class="fa fa-tachometer-alt fa-2x text-primary"></i>
                                    </div>
                                    <h5 class="lh-base text-uppercase mb-0">Fast & Reliable Services</h5>
                                </div>
                            </div>
                        </div>
                        <p><i class="fa fa-check-square text-primary me-3"></i>Many variations of passages of lorem ipsum
                        </p>
                        <p><i class="fa fa-check-square text-primary me-3"></i>Many variations of passages of lorem ipsum
                        </p>
                        <p><i class="fa fa-check-square text-primary me-3"></i>Many variations of passages of lorem ipsum
                        </p>
                        <div class="border border-5 border-primary p-4 text-center mt-4">
                            <h4 class="lh-base text-uppercase mb-0">We’re Good in All Metal Works Using Quality Welding Tools</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- About End --> */}

        {/* <!-- Features Start --> */}
        <div class="container-fluid pt-6 pb-6">
            <div class="container pt-4">
                <div class="row g-0 feature-row wow fadeIn" data-wow-delay="0.1s">
                    <div class="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.3s">
                        <div class="feature-item border h-100">
                            <div class="feature-icon btn-xxl-square bg-primary mb-4 mt-n4">
                                <i class="fa fa-hammer fa-2x text-white"></i>
                            </div>
                            <div class="p-5 pt-0">
                                <h5 class="text-uppercase mb-3">Quality Welding</h5>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.</p>
                                <a class="position-relative text-body text-uppercase small d-flex justify-content-between"
                                    href="#"><b class="bg-white pe-3">Read More</b> <i
                                        class="bi bi-arrow-right bg-white ps-3"></i></a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.4s">
                        <div class="feature-item border h-100">
                            <div class="feature-icon btn-xxl-square bg-primary mb-4 mt-n4">
                                <i class="fa fa-dollar-sign fa-2x text-white"></i>
                            </div>
                            <div class="p-5 pt-0">
                                <h5 class="text-uppercase">Affordable Pricing</h5>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.</p>
                                <a class="position-relative text-body text-uppercase small d-flex justify-content-between"
                                    href="#"><b class="bg-white pe-3">Read More</b> <i
                                        class="bi bi-arrow-right bg-white ps-3"></i></a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.5s">
                        <div class="feature-item border h-100">
                            <div class="feature-icon btn-xxl-square bg-primary mb-4 mt-n4">
                                <i class="fa fa-check-double fa-2x text-white"></i>
                            </div>
                            <div class="p-5 pt-0">
                                <h5 class="text-uppercase">Best Welder</h5>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.</p>
                                <a class="position-relative text-body text-uppercase small d-flex justify-content-between"
                                    href="#"><b class="bg-white pe-3">Read More</b> <i
                                        class="bi bi-arrow-right bg-white ps-3"></i></a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.6s">
                        <div class="feature-item border h-100">
                            <div class="feature-icon btn-xxl-square bg-primary mb-4 mt-n4">
                                <i class="fa fa-tools fa-2x text-white"></i>
                            </div>
                            <div class="p-5 pt-0">
                                <h5 class="text-uppercase">Quality Tools</h5>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tellus augue.</p>
                                <a class="position-relative text-body text-uppercase small d-flex justify-content-between"
                                    href="#"><b class="bg-white pe-3">Read More</b> <i
                                        class="bi bi-arrow-right bg-white ps-3"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- Features End --> */}
        </>
    )
}

export default LandingPage;