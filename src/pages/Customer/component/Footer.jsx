const Footer = () => {
    return(
        <>
        {/* <!-- Footer Start --> */}
        <div className="container-fluid bg-dark footer py-5 wow fadeIn" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="row g-5">
                    <div className="col-lg-3 col-md-6">
                        <h5 className="text-uppercase text-light mb-4">Our Office</h5>
                        <p className="mb-2"><i className="fa fa-map-marker-alt text-primary me-3"></i>123 Street, New York, USA</p>
                        <p className="mb-2"><i className="fa fa-phone-alt text-primary me-3"></i>+012 345 67890</p>
                        <p className="mb-2"><i className="fa fa-envelope text-primary me-3"></i>info@example.com</p>
                        <div className="d-flex pt-3">
                            <a className="btn btn-square btn-light me-2" href=""><i
                                    className="fab fa-twitter"></i></a>
                            <a className="btn btn-square btn-light me-2" href=""><i
                                    className="fab fa-facebook-f"></i></a>
                            <a className="btn btn-square btn-light me-2" href=""><i
                                    className="fab fa-youtube"></i></a>
                            <a className="btn btn-square btn-light me-2" href=""><i
                                    className="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <h5 className="text-uppercase text-light mb-4">Quick Links</h5>
                        <a className="btn btn-link" href="">About Us</a>
                        <a className="btn btn-link" href="/Contactus">Contact Us</a>
                        <a className="btn btn-link" href="">Our Services</a>
                        <a className="btn btn-link" href="">Terms & Condition</a>
                        <a className="btn btn-link" href="">Support</a>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <h5 className="text-uppercase text-light mb-4">Business Hours</h5>
                        <p className="text-uppercase mb-0">Monday - Friday</p>
                        <p>09:00 am - 07:00 pm</p>
                        <p className="text-uppercase mb-0">Saturday</p>
                        <p>09:00 am - 12:00 pm</p>
                        <p className="text-uppercase mb-0">Sunday</p>
                        <p>Closed</p>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <h5 className="text-uppercase text-light mb-4">Gallery</h5>
                        <div className="row g-1">
                            <div className="col-4">
                                <img className="img-fluid" src="./assets/image/service-1.jpg" alt=""/>
                            </div>
                            <div className="col-4">
                                <img className="img-fluid" src="./assets/image/service-2.jpg" alt=""/>
                            </div>
                            <div className="col-4">
                                <img className="img-fluid" src="./assets/image/service-3.jpg" alt=""/>
                            </div>
                            <div className="col-4">
                                <img className="img-fluid" src="./assets/image/service-4.jpg" alt=""/>
                            </div>
                            <div className="col-4">
                                <img className="img-fluid" src="./assets/image/service-5.jpg" alt=""/>
                            </div>
                            <div className="col-4">
                                <img className="img-fluid" src="./assets/image/service-6.jpg" alt=""/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- Footer End --> */}

        {/* <!-- Copyright Start --> */}
        <div className="container-fluid text-body copyright py-4">
            <div className="container">
                <div className="row">
                    <div className="col text-center text-md-center mb-3 mb-md-0">
                        &copy; <a className="fw-semi-bold" href="#">Your Site Name</a>, All Right Reserved.
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- Copyright End --> */}

        {/* <!-- Floating Action Buttons --> */}
        <div className="position-fixed bottom-0 end-0 m-3 m-md-4 d-flex flex-column gap-3" style={{zIndex: '1000'}}>
            
            {/* Messenger Message Button with Tooltip */}
            <div className="position-relative">
                <a 
                    href="https://m.me/your-page-username" 
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                        width: '60px', 
                        height: '60px',
                        backgroundColor: '#fff',
                        borderColor: '#fff'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    data-bs-title="Message us on Messenger"
                >
                    <i className="fab fa-facebook-messenger fs-4"></i>
                </a>
            </div>

            {/* Back to Top Button with Tooltip */}
            <div className="position-relative">
                <a 
                    href="#" 
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{width: '60px', height: '60px'}}
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    data-bs-title="Back to Top"
                >
                    <i className="bi bi-arrow-up fs-4"></i>
                </a>
            </div>
        </div>

        {/* <!-- Bootstrap Tooltip Initialization Script --> */}
        <script dangerouslySetInnerHTML={{
            __html: `
            document.addEventListener('DOMContentLoaded', function() {
                var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
                var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl)
                })
            })
            `
        }} />
        </>
    )
}

export default Footer;