import { useTranslation } from 'react-i18next';
import CustomProductOrder from "./CustomProductOrder";
import Footer from "./Footer";
import Header from "./Header";

const Services = () => {
    const { t } = useTranslation();
    return(
        <>
        <Header/>

        {/* <!-- Page Header Start --> */}
        <div className="container-fluid page-header pt-5 mb-6 wow fadeIn" data-wow-delay="0.1s">
            <div className="container text-center pt-5">
                <div className="row justify-content-center">
                    <div className="col-lg-7">
                        <div className="bg-white p-5">
                            <h1 className="display-6 text-uppercase mb-3 animated slideInDown">{t('services.title')}</h1>
                            <nav aria-label="breadcrumb animated slideInDown">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <li className="breadcrumb-item"><a href="#">{t('services.breadcrumbHome')}</a></li>
                                    <li className="breadcrumb-item"><a href="#">{t('services.breadcrumbPages')}</a></li>
                                    <li className="breadcrumb-item" aria-current="page">{t('services.breadcrumbServices')}</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- Page Header End --> */}

        {/* <!-- Service Start --> */}
        <div className="container-fluid service pb-6">
            <div className="container">
                <div className="text-center mx-auto wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: "600px" }}>
                    <h1 className="display-6 text-uppercase mb-5">{t('services.reliableWeldingServices')}</h1>
                </div>
                <div className="row g-4">
                    <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                        <div className="service-item">
                            <div className="service-inner pb-5">
                                <img className="img-fluid w-100" src="./assets/image/service-1.jpg" alt=""/>
                                <div className="service-text px-5 pt-4">
                                    <h5 className="text-uppercase">{t('services.metalWorks')}</h5>
                                        <p>{t('services.metalWorksDesc')}
                                        </p>
                                </div>
                                <a className="btn btn-light px-3" href="">{t('servicesPage.readMore')}<i
                                        className="bi bi-chevron-double-right ms-1"></i></a>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.2s">
                        <div className="service-item">
                            <div className="service-inner pb-5">
                                <img className="img-fluid w-100" src="./assets/image/service-2.jpg" alt=""/>
                                <div className="service-text px-5 pt-4">
                                    <h5 className="text-uppercase">{t('services.steelWelding')}</h5>
                                        <p>{t('services.steelWeldingDesc')}
                                        </p>
                                </div>
                                <a className="btn btn-light px-3" href="">{t('servicesPage.readMore')}<i
                                        className="bi bi-chevron-double-right ms-1"></i></a>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
                        <div className="service-item">
                            <div className="service-inner pb-5">
                                <img className="img-fluid w-100" src="./assets/image/service-3.jpg" alt=""/>
                                <div className="service-text px-5 pt-4">
                                    <h5 className="text-uppercase">{t('services.pipeWelding')}</h5>
                                        <p>{t('services.pipeWeldingDesc')}
                                        </p>
                                </div>
                                <a className="btn btn-light px-3" href="">{t('servicesPage.readMore')}<i
                                        className="bi bi-chevron-double-right ms-1"></i></a>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.4s">
                        <div className="service-item">
                            <div className="service-inner pb-5">
                                <img className="img-fluid w-100" src="./assets/image/service-4.jpg" alt=""/>
                                <div className="service-text px-5 pt-4">
                                    <h5 className="text-uppercase">{t('services.customWelding')}</h5>
                                        <p>{t('services.customWeldingDesc')}
                                        </p>
                                </div>
                                <a className="btn btn-light px-3" href="">{t('servicesPage.readMore')}<i
                                        className="bi bi-chevron-double-right ms-1"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- Service End --> */}

        {/* Custom Product Order Section */}
        <CustomProductOrder />

        <Footer/>
        </>
    )
}

export default Services;