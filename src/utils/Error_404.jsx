import Footer from "../pages/Customer/component/Footer";
import Header from "../pages/Customer/component/header";

const Error_404 = () => {
    return(
        <>
        <Header/>

        {/* <!-- Page Header Start --> */}
        <div class="container-fluid page-header pt-5 mb-6 wow fadeIn" data-wow-delay="0.1s">
            <div class="container text-center pt-5">
                <div class="row justify-content-center">
                    <div class="col-lg-7">
                        <div class="bg-white p-5">
                            <h1 class="display-6 text-uppercase mb-3 animated slideInDown">404</h1>
                            <nav aria-label="breadcrumb animated slideInDown">
                                <ol class="breadcrumb justify-content-center mb-0">
                                    <li class="breadcrumb-item"><a href="#">Home</a></li>
                                    <li class="breadcrumb-item"><a href="#">Pages</a></li>
                                    <li class="breadcrumb-item" aria-current="page">404</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- Page Header End --> */}


        {/* <!-- 404 Start --> */}
        <div class="container-fluid pb-6 wow fadeInUp" data-wow-delay="0.1s">
            <div class="container text-center">
                <div class="row justify-content-center">
                    <div class="col-lg-6">
                        <i class="bi bi-exclamation-triangle display-1 text-primary"></i>
                        <h1 class="display-1 text-uppercase">404</h1>
                        <h2 class="text-uppercase mb-4">Page Not Found</h2>
                        <p class="mb-4">We’re sorry, the page you have looked for does not exist in our website! Maybe go to our home page or try to use a search?</p>
                        <a class="btn btn-primary py-3 px-4" href="/">Go Back To Home</a>
                    </div>
                </div>
            </div>
        </div>
        {/* <!-- 404 End --> */}

        <Footer/>
        </>
    )
}

export default Error_404;