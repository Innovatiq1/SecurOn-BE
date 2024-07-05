import express from 'express';
import { userSignUp, userLogIn, forgotPassword, resetPassword } from '../controller/user-controller.js';
import { getAssets, uploadAssets, deleteAssets, updateAsset, fetchProductCves }
  from '../controller/inventory-controller.js';
import { getCves, searchCve } from '../controller/cve-controller.js';
import { vendorSearch, listOfProducts, listOfVendorProductsCves } from '../controller/vendor-product-cve-controller.js';

import { verifyTokenAuth, generateToken } from '../auth/auth.js';
import { RunFortiGaurdWebScraping } from '../controller/fortigaurd-controller.js';
import { RunSolarWindsWebScraping } from '../controller/solarwinds-controller.js';
import { RunDellWebScraping } from '../controller/dell-controller.js';
import { RunAlcatelWebScraping } from '../controller/alcatel-controller.js';
import { RunArubaWebScraping } from '../controller/aruba-controller.js';
import { getOemCveFixData } from '../controller/cveFixDetails-controller.js';
import { runOemCveScheduler } from '../controller/oem-cve-controller.js';
import { runOemProductsScheduler } from '../controller/oem-products-controller.js';
import { RunF5WebScraping } from '../controller/f5-controller.js';
import { RunCveFixScheduler } from '../controller/cveFix-scheduler-controller.js';
import { RunCveMappingScheduler } from '../controller/vendor-product-cve-mapping-controller.js';
import { RunAssetCveMappingScheduler } from '../controller/asset-cve-mapping-controller.js';
import { RunAssetProductCveMappingScheduler } from '../controller/asset-product-cve-mapping-controller.js';
import { RunCiscoScraping } from '../controller/cisco-controller.js';
import { RunCveScheduler } from '../controller/cve-scheduler-controller.js';
import { getOemVendorList, getProductsByVendor, searchCriteria, getCveDetails } from '../controller/searchdashboard-controller.js';
import { getCvesByDateRange, getCvesCountByDateRange, getCveDataBySeviarity, getCircularDashboardData, getVulnarabilityTrendData, getCveDataByBrand, getCveDataByAsset, getCveDataByProject } from '../controller/cvedashboard-controller.js';

const router = express.Router();

import multer from 'multer';

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
//login & signup
router.post('/signup', userSignUp);
router.post('/login', userLogIn);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);

router.get('/getAssets', verifyTokenAuth, getAssets);
router.get('/getCves/:month/:year', verifyTokenAuth, getCves);
router.post("/uploadAssets", verifyTokenAuth, upload.single("xlsx"), uploadAssets);
router.post('/deleteAssets', verifyTokenAuth, deleteAssets);
router.post('/fetchcves',  fetchProductCves);
router.post('/updateAsset', verifyTokenAuth, updateAsset);

router.post('/vendorSearch', verifyTokenAuth, vendorSearch);
router.post('/listOfProducts', verifyTokenAuth, listOfProducts);
router.post('/listOfVendorProductsCves', verifyTokenAuth, listOfVendorProductsCves);

router.get('/RunCveScheduler', RunCveScheduler);
router.get('/RunFortiGaurdWebScraping', RunFortiGaurdWebScraping);
router.get('/RunSolarWindsWebScraping', RunSolarWindsWebScraping);
router.get('/RunDellWebScraping', RunDellWebScraping);
router.get('/RunAlcatelWebScraping', RunAlcatelWebScraping);
router.get('/RunArubaWebScraping', RunArubaWebScraping);
router.get('/RunF5WebScraping', RunF5WebScraping);
router.get('/RunCiscoScraping', RunCiscoScraping);

router.get('/getOemData/:cve', verifyTokenAuth, getOemCveFixData);
router.get('/searchCve/:cveId', verifyTokenAuth, searchCve);
router.get('/runOemCveScheduler', runOemCveScheduler);
router.get('/runOemProductsScheduler', runOemProductsScheduler);
router.get('/RunCveFixScheduler', RunCveFixScheduler);
router.get('/RunCveMappingScheduler', RunCveMappingScheduler);
router.get('/RunAssetCveMappingScheduler', RunAssetCveMappingScheduler);
router.get('/RunAssetProductCveMappingScheduler', RunAssetProductCveMappingScheduler);

router.get('/getOemVendorList', getOemVendorList);
router.post('/getProductsByVendor', getProductsByVendor);
router.post('/searchCriteria', searchCriteria);
router.post('/getCveDetails', getCveDetails);


router.post('/getAllCvesByDateRange', getCvesByDateRange);
//router.post('/getOemCvesByDateRange', getOemCvesByDateRange);
router.post('/getCvesCountByDateRange', getCvesCountByDateRange);
router.post('/getCveDataBySeviarity', getCveDataBySeviarity);
router.post('/getCircularDashboardData', getCircularDashboardData);
router.post('/getVulnarabilityTrendData', getVulnarabilityTrendData);
// router.post('/getCveDataBySeviarity', getCveDataBySeviarity);
router.post('/getCveDataByBrand', getCveDataByBrand);
router.post('/getCveDataByAsset', getCveDataByAsset);
router.post('/getCveDataByProject', getCveDataByProject);
export default router;


