import express from 'express';
import { userSignUp, userLogIn, forgotPassword, resetPassword } from '../controller/user-controller.js';
import { getAssets,getOnlyAssets,getAssetsByBrand,getAssetsByTypeAndDate,getAssetsByBrandName, uploadAssets,createAsset, deleteAssets, updateAsset, fetchProductCves }
  from '../controller/inventory-controller.js';
import { getCves, searchCve } from '../controller/cve-controller.js';
import { vendorSearch, listOfProducts, listOfVendorProductsCves } from '../controller/vendor-product-cve-controller.js';

import {  generateToken } from '../auth/auth.js';
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
import { RunSecurityAdvisoryMappingScheduler } from '../controller/security-advisory-mapping-controller.js';
import { RunAssetProductCveMappingScheduler,getVenderProductCves,getVenderProductForGraphs } from '../controller/asset-product-cve-mapping-controller.js';
import { RunCiscoScraping } from '../controller/cisco-controller.js';
import { RunCveScheduler,getFilteredCves,getNewUpdatedCves,getCveCountByWeakness,getCveRecordsByWeaknessAndDate } from '../controller/cve-scheduler-controller.js';
import { getOemVendorList, getProductsByVendor, searchCriteria, getCveDetails, getSearchCveDetails } from '../controller/searchdashboard-controller.js';
import { getCvesByDateRange, getCvesCountByDateRange, getCveDataBySeviarity, getCircularDashboardData, getVulnarabilityTrendData, getCveDataByBrand, getCveDataByAsset, getCveDataByProject,getCveDataCountByProject,getAllVendors } from '../controller/cvedashboard-controller.js';
import { getNistLogs,getSystemLogs, getUserActivityLogs ,getSchedulerLogs} from '../controller/logs-controller.js';
import { runTopAffectedProductsBrandsScheduler,getAffectedProducts,getTopAffectedProducts } from '../controller/affected-products-brands-controller.js';
import { saveScanType, getAllScanTypes, updateScanType, deleteScanType, filterScanType } from '../controller/scan-type-controller.js';

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

router.get('/getAssets',  getAssets);
router.get('/getOnlyAssets',  getOnlyAssets);

router.get('/getCves/:month/:year',  getCves);
router.post("/uploadAssets",  upload.single("xlsx"), uploadAssets);
router.post("/createAsset", createAsset);

router.post('/deleteAssets',  deleteAssets);
router.post('/fetchcves',  fetchProductCves);
router.post('/updateAsset',  updateAsset);

router.post('/vendorSearch',  vendorSearch);
router.post('/listOfProducts',  listOfProducts);
router.post('/listOfVendorProductsCves',  listOfVendorProductsCves);

router.get('/RunCveScheduler', RunCveScheduler);
router.get('/RunFortiGaurdWebScraping', RunFortiGaurdWebScraping);
router.get('/RunSolarWindsWebScraping', RunSolarWindsWebScraping);
router.get('/RunDellWebScraping', RunDellWebScraping);
router.get('/RunAlcatelWebScraping', RunAlcatelWebScraping);
router.get('/RunArubaWebScraping', RunArubaWebScraping);
router.get('/RunF5WebScraping', RunF5WebScraping);
router.get('/RunCiscoScraping', RunCiscoScraping);

router.get('/getOemData/:cve',  getOemCveFixData);
router.get('/searchCve/:cveId',  searchCve);
router.get('/runOemCveScheduler', runOemCveScheduler);
router.get('/runOemProductsScheduler', runOemProductsScheduler);
router.get('/RunCveFixScheduler', RunCveFixScheduler);
router.get('/RunCveMappingScheduler', RunCveMappingScheduler);
router.get('/RunAssetCveMappingScheduler', RunAssetCveMappingScheduler);
router.get('/RunSecurityAdvisoryMappingScheduler', RunSecurityAdvisoryMappingScheduler);
router.get('/RunAssetProductCveMappingScheduler', RunAssetProductCveMappingScheduler);
router.get('/runTopAffectedProductsBrandsScheduler', runTopAffectedProductsBrandsScheduler);
router.post('/getVenderProductCves', getVenderProductCves);
router.post('/getVenderProductForGraphs', getVenderProductForGraphs);
router.get('/getOemVendorList', getOemVendorList);
router.post('/getProductsByVendor', getProductsByVendor);
router.post('/searchCriteria', searchCriteria);
router.post('/getCveDetails', getCveDetails);
router.post('/getCveSearchDetails', getSearchCveDetails);


router.post('/getAllCvesByDateRange', getCvesByDateRange);
//router.post('/getOemCvesByDateRange', getOemCvesByDateRange);
router.post('/getCvesCountByDateRange', getCvesCountByDateRange);
router.post('/getCveDataBySeviarity', getCveDataBySeviarity);
router.post('/getCircularDashboardData', getCircularDashboardData);
router.get('/getAllVendors', getAllVendors);
router.post('/getVulnarabilityTrendData', getVulnarabilityTrendData);
// router.post('/getCveDataBySeviarity', getCveDataBySeviarity);
router.post('/getCveDataByBrand', getCveDataByBrand);
router.post('/getCveDataByAsset', getCveDataByAsset);
router.post('/getCveDataByProject', getCveDataByProject);
router.post('/getCveDataCountByProject', getCveDataCountByProject);

router.post('/getNistLogs', getNistLogs);
router.post('/getSystemLogs', getSystemLogs);
router.post('/getUserActivityLogs', getUserActivityLogs);
router.post('/getSchedulerLogs', getSchedulerLogs);
router.post('/getAffectedProducts', getAffectedProducts);
router.post('/getTopAffectedProducts',getTopAffectedProducts)
router.post('/getFilteredCves',getFilteredCves)
router.post('/getNewUpdatedCves',getNewUpdatedCves)
router.post('/getAssetsByBrand',getAssetsByBrand)
router.post('/getAssetsByTypeAndDate',getAssetsByTypeAndDate)
router.post('/getAssetsByBrandName',getAssetsByBrandName)
router.post('/getCveCountByWeakness',getCveCountByWeakness)
router.post('/getCveRecordsByWeaknessAndDate',getCveRecordsByWeaknessAndDate)

router.post('/saveScanType', saveScanType);
router.get('/getAllScanTypes', getAllScanTypes);
router.put('/updateScanType/:id', updateScanType);
router.delete('/deleteScanType/:id', deleteScanType);
router.post('/filterScanType', filterScanType);

export default router;


