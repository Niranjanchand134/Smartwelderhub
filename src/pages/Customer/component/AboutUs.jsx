import { useTranslation } from 'react-i18next';
import Header from "./Header";
import Footer from "./Footer";

const AboutUs = () => {
    const { t } = useTranslation();
    return (
        <>
            <Header />
            
            {/* <!-- Page Header Start --> */}
            <div className="container-fluid page-header pt-5 mb-6 wow fadeIn" data-wow-delay="0.1s">
                <div className="container text-center pt-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-7">
                            <div className="bg-white p-5">
                                <h1 className="display-6 text-uppercase mb-3 animated slideInDown">{t('aboutUs.title')}</h1>
                                <nav aria-label="breadcrumb animated slideInDown">
                                    <ol className="breadcrumb justify-content-center mb-0">
                                        <li className="breadcrumb-item"><a href="#">{t('aboutUs.breadcrumbHome')}</a></li>
                                        <li className="breadcrumb-item"><a href="#">{t('aboutUs.breadcrumbPages')}</a></li>
                                        <li className="breadcrumb-item" aria-current="page">{t('aboutUs.breadcrumbAbout')}</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Page Header End --> */}

            {/* About Start */}
            <div className="container-fluid pt-3 pb-6">
                <div className="container">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                            <div className="about-img">
                                <img className="img-fluid w-100" src="./assets/image/about.jpg" alt="About SmartWeld" />
                            </div>
                        </div>
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                            <h1 className="display-6 text-uppercase mb-4">{t('aboutUs.welcomeTitle')}</h1>
                            <p className="mb-4">
                                {t('aboutUs.welcomeDesc')}
                            </p>
                            <div className="row g-4 mb-4">
                                <div className="col-sm-6">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 btn-xl-square bg-light me-3">
                                            <i className="fa fa-award fa-2x text-primary"></i>
                                        </div>
                                        <div>
                                            <h5 className="lh-base text-uppercase mb-0">{t('aboutUs.certifiedExperts')}</h5>
                                            <small className="text-muted">{t('aboutUs.professionalLicensed')}</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 btn-xl-square bg-light me-3">
                                            <i className="fa fa-check-circle fa-2x text-primary"></i>
                                        </div>
                                        <div>
                                            <h5 className="lh-base text-uppercase mb-0">{t('aboutUs.qualityAssured')}</h5>
                                            <small className="text-muted">{t('aboutUs.satisfaction100')}</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 btn-xl-square bg-light me-3">
                                            <i className="fa fa-tachometer-alt fa-2x text-primary"></i>
                                        </div>
                                        <div>
                                            <h5 className="lh-base text-uppercase mb-0">{t('aboutUs.fastService')}</h5>
                                            <small className="text-muted">{t('aboutUs.quickEfficient')}</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 btn-xl-square bg-light me-3">
                                            <i className="fa fa-dollar-sign fa-2x text-primary"></i>
                                        </div>
                                        <div>
                                            <h5 className="lh-base text-uppercase mb-0">{t('aboutUs.affordablePricing')}</h5>
                                            <small className="text-muted">{t('aboutUs.bestValue')}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border border-5 border-primary p-4 text-center mt-4">
                                <h4 className="lh-base text-uppercase mb-0">{t('aboutUs.committedToExcellence')}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* About End */}

            {/* Mission & Vision Start */}
            <div className="container-fluid py-5">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                            <div className="h-100 bg-light p-5">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="btn-lg-square bg-primary rounded-circle me-3">
                                        <i className="fa fa-bullseye fa-2x text-white"></i>
                                    </div>
                                    <h2 className="text-uppercase mb-0">{t('aboutUs.ourMission')}</h2>
                                </div>
                                <p className="mb-4">
                                    {t('aboutUs.missionDesc1')}
                                </p>
                                <p className="mb-0">
                                    {t('aboutUs.missionDesc2')}
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                            <div className="h-100 bg-light p-5">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="btn-lg-square bg-primary rounded-circle me-3">
                                        <i className="fa fa-eye fa-2x text-white"></i>
                                    </div>
                                    <h2 className="text-uppercase mb-0">{t('aboutUs.ourVision')}</h2>
                                </div>
                                <p className="mb-4">
                                    {t('aboutUs.visionDesc1')}
                                </p>
                                <p className="mb-0">
                                    {t('aboutUs.visionDesc2')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Mission & Vision End */}

            {/* Stats Start */}
            <div className="container-fluid bg-primary py-5 mb-5">
                <div className="container py-5">
                    <div className="row g-5">
                        <div className="col-lg-3 col-md-6 wow fadeIn" data-wow-delay="0.1s">
                            <div className="d-flex align-items-center">
                                <div className="btn-lg-square bg-white rounded-circle me-3">
                                    <i className="fa fa-users fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h2 className="text-white mb-0">500+</h2>
                                    <p className="text-white mb-0">{t('aboutUs.happyClients')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 wow fadeIn" data-wow-delay="0.3s">
                            <div className="d-flex align-items-center">
                                <div className="btn-lg-square bg-white rounded-circle me-3">
                                    <i className="fa fa-hammer fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h2 className="text-white mb-0">1000+</h2>
                                    <p className="text-white mb-0">{t('aboutUs.projectsDone')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 wow fadeIn" data-wow-delay="0.5s">
                            <div className="d-flex align-items-center">
                                <div className="btn-lg-square bg-white rounded-circle me-3">
                                    <i className="fa fa-user-tie fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h2 className="text-white mb-0">50+</h2>
                                    <p className="text-white mb-0">{t('aboutUs.expertWelders')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 wow fadeIn" data-wow-delay="0.7s">
                            <div className="d-flex align-items-center">
                                <div className="btn-lg-square bg-white rounded-circle me-3">
                                    <i className="fa fa-star fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h2 className="text-white mb-0">98%</h2>
                                    <p className="text-white mb-0">{t('aboutUs.satisfactionRate')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Stats End */}

            {/* Why Choose Us Start */}
            <div className="container-fluid pt-6 pb-6">
                <div className="container">
                    <div className="text-center mx-auto mb-5 wow fadeIn" data-wow-delay="0.1s" style={{maxWidth: '600px'}}>
                        <h1 className="display-6 text-uppercase mb-4">{t('aboutUs.whyChooseUs')}</h1>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-4 col-md-6 wow fadeIn" data-wow-delay="0.1s">
                            <div className="service-item border h-100 p-5">
                                <div className="btn-square bg-light rounded-circle mb-4" style={{width: '64px', height: '64px'}}>
                                    <i className="fa fa-certificate fa-2x text-primary"></i>
                                </div>
                                <h4 className="mb-3">{t('aboutUs.certifiedProfessionals')}</h4>
                                <p className="mb-4">{t('aboutUs.certifiedProfessionalsDesc')}</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 wow fadeIn" data-wow-delay="0.3s">
                            <div className="service-item border h-100 p-5">
                                <div className="btn-square bg-light rounded-circle mb-4" style={{width: '64px', height: '64px'}}>
                                    <i className="fa fa-shield-alt fa-2x text-primary"></i>
                                </div>
                                <h4 className="mb-3">{t('aboutUs.safetyFirst')}</h4>
                                <p className="mb-4">{t('aboutUs.safetyFirstDesc')}</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 wow fadeIn" data-wow-delay="0.5s">
                            <div className="service-item border h-100 p-5">
                                <div className="btn-square bg-light rounded-circle mb-4" style={{width: '64px', height: '64px'}}>
                                    <i className="fa fa-tools fa-2x text-primary"></i>
                                </div>
                                <h4 className="mb-3">{t('aboutUs.advancedEquipment')}</h4>
                                <p className="mb-4">{t('aboutUs.advancedEquipmentDesc')}</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 wow fadeIn" data-wow-delay="0.7s">
                            <div className="service-item border h-100 p-5">
                                <div className="btn-square bg-light rounded-circle mb-4" style={{width: '64px', height: '64px'}}>
                                    <i className="fa fa-clock fa-2x text-primary"></i>
                                </div>
                                <h4 className="mb-3">{t('aboutUs.timelyDelivery')}</h4>
                                <p className="mb-4">{t('aboutUs.timelyDeliveryDesc')}</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 wow fadeIn" data-wow-delay="0.9s">
                            <div className="service-item border h-100 p-5">
                                <div className="btn-square bg-light rounded-circle mb-4" style={{width: '64px', height: '64px'}}>
                                    <i className="fa fa-headset fa-2x text-primary"></i>
                                </div>
                                <h4 className="mb-3">{t('aboutUs.support247')}</h4>
                                <p className="mb-4">{t('aboutUs.support247Desc')}</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 wow fadeIn" data-wow-delay="1.1s">
                            <div className="service-item border h-100 p-5">
                                <div className="btn-square bg-light rounded-circle mb-4" style={{width: '64px', height: '64px'}}>
                                    <i className="fa fa-handshake fa-2x text-primary"></i>
                                </div>
                                <h4 className="mb-3">{t('aboutUs.customSolutions')}</h4>
                                <p className="mb-4">{t('aboutUs.customSolutionsDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Why Choose Us End */}

            {/* Team Start */}
            <div className="container-fluid py-5">
                <div className="container">
                    <div className="text-center mx-auto mb-5 wow fadeIn" data-wow-delay="0.1s" style={{maxWidth: '600px'}}>
                        <h1 className="display-6 text-uppercase mb-4">{t('aboutUs.expertTeam')}</h1>
                        <p className="mb-0">{t('aboutUs.expertTeamDesc')}</p>
                    </div>
                    <div className="row g-4 team">
                        <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="team-item">
                                <div className="position-relative overflow-hidden">
                                    <img className="img-fluid w-100" src="./assets/image/team-1.jpg" alt="Team Member" />
                                    <div className="team-social">
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-facebook-f"></i></a>
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-twitter"></i></a>
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-linkedin-in"></i></a>
                                    </div>
                                </div>
                                <div className="bg-light text-center p-4">
                                    <h5 className="text-uppercase">John Smith</h5>
                                    <p className="m-0">{t('aboutUs.masterWelder')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
                            <div className="team-item">
                                <div className="position-relative overflow-hidden">
                                    <img className="img-fluid w-100" src="./assets/image/team-2.jpg" alt="Team Member" />
                                    <div className="team-social">
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-facebook-f"></i></a>
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-twitter"></i></a>
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-linkedin-in"></i></a>
                                    </div>
                                </div>
                                <div className="bg-light text-center p-4">
                                    <h5 className="text-uppercase">Sarah Johnson</h5>
                                    <p className="m-0">{t('aboutUs.seniorFabricator')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
                            <div className="team-item">
                                <div className="position-relative overflow-hidden">
                                    <img className="img-fluid w-100" src="./assets/image/team-3.jpg" alt="Team Member" />
                                    <div className="team-social">
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-facebook-f"></i></a>
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-twitter"></i></a>
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-linkedin-in"></i></a>
                                    </div>
                                </div>
                                <div className="bg-light text-center p-4">
                                    <h5 className="text-uppercase">Mike Davis</h5>
                                    <p className="m-0">{t('aboutUs.qualityInspector')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.7s">
                            <div className="team-item">
                                <div className="position-relative overflow-hidden">
                                    <img className="img-fluid w-100" src="./assets/image/team-4.jpg" alt="Team Member" />
                                    <div className="team-social">
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-facebook-f"></i></a>
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-twitter"></i></a>
                                        <a className="btn btn-square btn-light rounded-circle mx-1" href="#"><i className="fab fa-linkedin-in"></i></a>
                                    </div>
                                </div>
                                <div className="bg-light text-center p-4">
                                    <h5 className="text-uppercase">Emily Wilson</h5>
                                    <p className="m-0">{t('aboutUs.projectManager')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Team End */}

            {/* CTA Start */}
            <div className="container-fluid py-5 mb-5">
                <div className="container py-5">
                    <div className="bg-primary rounded">
                        <div className="row g-0 align-items-center">
                            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                                <div className="bg-primary p-5">
                                    <h1 className="display-5 text-white mb-4">{t('aboutUs.readyToStart')}</h1>
                                    <p className="text-white mb-4">{t('aboutUs.readyToStartDesc')}</p>
                                    <a href="/Contactus" className="btn btn-light py-3 px-5">{t('aboutUs.getInTouch')}</a>
                                </div>
                            </div>
                            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                                <div className="bg-white p-5">
                                    <h2 className="text-uppercase mb-4">{t('aboutUs.quickContact')}</h2>
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="btn-square bg-primary rounded-circle me-3">
                                            <i className="fa fa-phone text-white"></i>
                                        </div>
                                        <span>+977- 9865000000</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="btn-square bg-primary rounded-circle me-3">
                                            <i className="fa fa-envelope text-white"></i>
                                        </div>
                                        <span>info@smartweld.com</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="btn-square bg-primary rounded-circle me-3">
                                            <i className="fa fa-map-marker-alt text-white"></i>
                                        </div>
                                        <span>Lalitpur, Kumaripati, Nepal</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* CTA End */}

            <Footer />
        </>
    );
};

export default AboutUs;
