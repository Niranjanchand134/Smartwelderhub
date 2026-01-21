import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return(
        <>
        {/* <!-- Footer Start --> */}
        <div className="container-fluid bg-dark footer py-5 wow fadeIn" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="row g-5">
                    <div className="col-lg-3 col-md-6">
                        <h5 className="text-uppercase text-light mb-4">{t('footer.ourOffice')}</h5>
                        <p className="mb-2"><i className="fa fa-map-marker-alt text-primary me-3"></i>Lalitpur, Kumaripati</p>
                        <p className="mb-2"><i className="fa fa-phone-alt text-primary me-3"></i>+977-9865000000</p>
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
                        <h5 className="text-uppercase text-light mb-4">{t('footer.quickLinks')}</h5>
                        <a className="btn btn-link" href="/aboutus">{t('footer.aboutUs')}</a>
                        <a className="btn btn-link" href="/Contactus">{t('footer.contactUs')}</a>
                        <a className="btn btn-link" href="/services">{t('footer.ourServices')}</a>
                        <a className="btn btn-link" href="/contactus">{t('footer.support')}</a>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <h5 className="text-uppercase text-light mb-4">{t('footer.businessHours')}</h5>
                        <p className="text-uppercase mb-0">{t('footer.mondayFriday')}</p>
                        <p>09:00 am - 07:00 pm</p>
                        <p className="text-uppercase mb-0">{t('footer.saturday')}</p>
                        <p>09:00 am - 12:00 pm</p>
                        <p className="text-uppercase mb-0">{t('footer.sunday')}</p>
                        <p>{t('footer.closed')}</p>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <h5 className="text-uppercase text-light mb-4">{t('footer.gallery')}</h5>
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
                        &copy; <a className="fw-semi-bold" href="#">SmartWeld Hub</a>, {t('footer.allRightReserved')}.
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- Copyright End --> */}
        </>
    )
}

export default Footer;
