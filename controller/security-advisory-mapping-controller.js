import InventoryModel from "../model/inventorySchema.js";
import vendorProductCveModel from "../model/vendorProductCveSchema.js";
import {
  systemLogger,
  userActivityLogger,
  runAssetCVEMappingSchedulerLogger,
} from "../helpers/loggers.js";
import rp from "request-promise";
import { createRequire } from "module"; // Allows usage of require in ES module
import { version } from "os";
const require = createRequire(import.meta.url);
const cheerio = require("cheerio");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const $ = require("jquery");
const puppeteer = require("puppeteer");
const axios = require("axios");
const https = require("https");

function getFixedRelease(firmwareVersion, html) {
  const dom = new JSDOM(html);
  const $ = require("jquery")(dom.window);
  let fixedRelease = null;

  // Iterate through the table rows
  $("table tbody tr").each((index, row) => {
    const columns = $(row).find("td"); // Get all columns in the row
    const releaseVersion = $(columns[0]).text().trim(); // First column value (Cisco ISE Release)

    // Match the firmware version
    if (releaseVersion === firmwareVersion) {
      fixedRelease = $(columns[1]).text().trim(); // Get second column value (First Fixed Release)
      return false; // Break out of the loop after finding the match
    }
  });

  return fixedRelease;
}
export const RunSecurityAdvisoryMappingScheduler = async (
  request,
  response
) => {
  try {
    const cves = await vendorProductCveModel.find({
      vendorName: "Cisco",cveId:"CVE-2017-12240"
    });
    let count = 0;
    // CVE-2024-26011
    for (const cve of cves) {
      count += 1;
      console.log("Processing CVE Count:", count);

      let fixedRelease = "";
      let advisoryTitle = "";
      let advisoryUrl = "";
      let workarounds = "";
      let vulnerableComponent = "";
      let vulnerableFeature = "";

      try {
        if (cve.vendorName === "Cisco") {
          const puppeteer = require("puppeteer");
          function parseVersion(versionStr) {
            const match = versionStr.match(/^(\d+)\.(\d+)/);
            return {
              major: match ? parseInt(match[1], 10) : 0,
              minor: match ? parseInt(match[2], 10) : 0,
            };
          }

          // const matchingUrls = cve?.cveDetails?.cve?.references.filter((ref) =>
          //   ref.url.includes("cisco.com")
          // );
          // advisoryUrl =
          //   matchingUrls?.[0]?.url || cve?.cveDetails?.cve?.references[0]?.url;
          const matchingUrls = cve?.cveDetails?.cve?.references.filter((ref) =>
            ref.url.includes("cisco.com")
          );
          
          const isValidCiscoUrl = matchingUrls?.length > 0 &&
            !matchingUrls[0].url.endsWith(".html")&& !matchingUrls[0].url.endsWith("CSCsm45390");
          
          if (isValidCiscoUrl) {
            advisoryUrl = matchingUrls[0].url;
          } else {
            const cveId = cve?.cveId;
            if (cveId) {
              advisoryUrl = await getCiscoAdvisoryUrl(cveId);
            } else {
              advisoryUrl = cve?.cveDetails?.cve?.references?.[0]?.url;
            }
          }


          async function getCiscoAdvisoryUrl(cveId) {
            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();
          
            try {
              const searchUrl = `https://sec.cloudapps.cisco.com/security/center/publicationListing.x?product=Cisco&keyword=${cveId}&sort=-day_sir#~Vulnerabilities`;
          console.log("gott",searchUrl)
              await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });
          
              await page.waitForSelector("table tbody tr td a", { timeout: 15000 });
          
              const hasResults = await page.$eval("table tbody tr td a", (el) =>
                Boolean(el?.href)
              );
          
              if (!hasResults) return null;
          
              const advisoryUrl = await page.$eval("table tbody tr td a", (a) => a.href);
          
              return advisoryUrl;
            } catch (err) {
              console.error("Cisco advisory search failed:", err.message);
              return null;
            } finally {
              await browser.close();
            }
          }

          
            // advisoryUrl.toLowerCase().includes(".html")
          
          if (
            !advisoryUrl ||
            advisoryUrl.toLowerCase().includes(".pdf") 
          ) {
            advisoryUrl = "-"
            console.log("Skipping PDF or unsupported URL:", advisoryUrl);
          } else {
            const html = await rp(advisoryUrl).catch((err) => {
              console.error(
                `Error fetching advisory URL (${advisoryUrl}):`,
                err.message
              );
            });
            
            if (html) {
              const $ = cheerio.load(html);
              advisoryTitle = $("h1").text().trim().replace(/^Cisco Security Advisory\s*/, '');

              const workaroundsHeading = $("h2").filter((i, el) =>
                $(el).text().toLowerCase().includes("workarounds")
              );
              workarounds = workaroundsHeading.nextUntil("h2").text().trim();
              const headings = ["determine", "determining"];

              // Find all headings that include "determine" or "determining"
              const matches = $("h3").filter((i, el) => {
                const headingText = $(el).text().toLowerCase();
                return headings.some((keyword) =>
                  headingText.includes(keyword)
                );
              });

              if (matches.length) {
                matches.each((i, el) => {
                  const headingText = $(el).text().trim(); // Extract the heading text
                  const featureText = $(el)
                    .nextUntil("h1") // Get content until the next `h1`
                    .text()
                    .trim();

                  // Append the heading and feature to vulnerableFeature without "Heading:" prefix
                  vulnerableFeature += `${headingText}\n${featureText}\n\n`;
                });
              }

              // Trim any trailing newlines (optional)
              vulnerableFeature = vulnerableFeature.trim();

              // Check for vulnerable component
              // const affectedProductsHeading = $("h2").filter((i, el) =>
              //   $(el).text().toLowerCase().includes("affected products")
              // );
              // const vulnerableComponentText = affectedProductsHeading
              //   .nextUntil("h3")
              //   .text();

              // const match = vulnerableComponentText.match(
              //   /(?:\b\w+\b\s+){0,4}enabled/i
              // );
              // vulnerableComponent = match ? match[0].trim() : "";
              const affectedProductsHeading = $("h2").filter((i, el) =>
                $(el).text().toLowerCase().includes("affected products")
              );
              const vulnerableComponentText = affectedProductsHeading
                .nextAll()
                .text();
              // const match = vulnerableComponentText.match(/This vulnerability affects .*? enabled\./i);
              // vulnerableComponent = match ? match[0].trim() : "";``
              // Extract a longer portion of the text
              const match = vulnerableComponentText.match(
                /(This vulnerability|These vulnerabilities) (affects|affected|affect) .*?(?:enabled:\s*)?([\s\S]*)/i
              );

              if (match) {
                const vulnerableProducts = match[2]
                  .split("\n")
                  .map((line) => line.replace(/^[-•]\s*/, "").trim()) // Remove bullets and trim spaces
                  .filter((line) => line.length > 0);
              }
              vulnerableComponent = match ? match[0].trim() : "";

              const getReleaseVersions = [
                cve.version.includes("(") && cve.version.includes(")")
                  ? cve.version
                      .substring(
                        0,
                        cve.version.indexOf(")", cve.version.indexOf("(")) + 1
                      )
                      .trim()
                  : cve.version.trim(),
                cve.version.substring(0, cve.version.lastIndexOf("(")).trim(),
                cve.version
                  .substring(0, cve.version.lastIndexOf(")") + 1)
                  .trim(),
                cve.version.split(".").slice(0, 2).join("."),
                cve.version.split("(")[0].trim(),
              ];

              for (const version of getReleaseVersions) {
                const formattedVersion = version.replace(
                  /[a-zA-Z]/g,
                  (letter) => letter.toUpperCase()
                );
                // const release = getFixedRelease(formattedVersion, html);

                // if (release) {
                //   fixedRelease = release;
                //   break;
                // }
                const release = (() => {
                  const $ = cheerio.load(html);
                  const inputParsed = parseVersion(formattedVersion);
                  let result = null;

                  $("table tr").each((i, el) => {
                    const cols = $(el).find("td");
                    if (cols.length < 2) return;

                    const versionText = $(cols[0]).text().trim();
                    const fixedText = $(cols[1]).text().trim();

                    if (versionText.toLowerCase().includes("and earlier")) {
                      const baseVersion = versionText.split(" ")[0];
                      const baseParsed = parseVersion(baseVersion);
                      if (
                        inputParsed.major < baseParsed.major ||
                        (inputParsed.major === baseParsed.major &&
                          inputParsed.minor <= baseParsed.minor)
                      ) {
                        result = fixedText;
                      }
                    } else {
                      const rowParsed = parseVersion(versionText);
                      if (
                        inputParsed.major === rowParsed.major &&
                        inputParsed.minor === rowParsed.minor
                      ) {
                        result = fixedText;
                      }
                    }
                  });

                  return result;
                })();

                if (release) {
                  fixedRelease = release;
                  break;
                }
              }
            }
          }
        }

        if (cve.vendorName === "Fortinet") {
          advisoryUrl = cve?.cveDetails?.cve?.references[0]?.url;
          const html = await rp(advisoryUrl).catch((err) => {
            console.error(
              `Error fetching Fortinet advisory URL (${advisoryUrl}):`,
              err.message
            );
          });

          if (html) {
            const $ = cheerio.load(html);
            advisoryTitle = $("h1").text().trim();

            // $("table")
            //   .find("tbody tr")
            //   .each(function () {
            //     const affectedRange = $(this).find("td").eq(1).text().trim();
            //     const solution = $(this).find("td").eq(2).text().trim();
            //     const [start, end] = affectedRange
            //       .split("through")
            //       .map((v) => v.trim());
            $("table")
              .find("tbody tr")
              .each(function () {
                const affectedRange = $(this)
                  .find("td")
                  .eq(1)
                  .text()
                  .trim()
                  .toLowerCase();
                const solution = $(this).find("td").eq(2).text().trim();

                let start, end;

                if (affectedRange.includes("through")) {
                  [start, end] = affectedRange
                    .split("through")
                    .map((v) => v.trim());
                } else if (affectedRange.includes("all versions")) {
                  // Handle "6.2 all versions"
                  start = affectedRange.replace("all versions", "").trim();
                  end = start + ".999"; // artificial high patch version to include everything
                } else {
                  return; // Skip if format is unknown
                }

                const normalizeVersion = (version) => {
                  const parts = version.split(".").map(Number);
                  while (parts.length < 3) {
                    parts.push(0);
                  }
                  return parts;
                };

                const compareVersions = (v1, v2) => {
                  const [major1, minor1, patch1] = normalizeVersion(v1);
                  const [major2, minor2, patch2] = normalizeVersion(v2);

                  if (major1 !== major2) return major1 - major2;
                  if (minor1 !== minor2) return minor1 - minor2;
                  return patch1 - patch2;
                };

                if (
                  compareVersions(cve.version, start) >= 0 &&
                  compareVersions(cve.version, end) <= 0
                ) {
                  fixedRelease = solution;
                  return false;
                }
              });

            if (!fixedRelease) {
              fixedRelease = $("h3")
                .filter((i, el) =>
                  $(el).text().toLowerCase().includes("solutions")
                )
                .nextUntil("h3")
                .map((i, el) => $(el).text().trim())
                .get()
                .join("\n");
            }
          }
        }
        if (cve.vendorName == "Microsoft") {
          const puppeteer = require("puppeteer");

          async function fetchMicrosoftAdvisoryTitle(cveId) {
            advisoryUrl = `https://msrc.microsoft.com/update-guide/vulnerability/${cveId}`;

            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            try {
              await page.goto(advisoryUrl, {
                waitUntil: "networkidle2",
                timeout: 60000,
              });

              // Wait for the title element to be rendered
              await page.waitForSelector("h1");

              // Extract the title text
              const advisoryTitle = await page.$eval("h1", (el) =>
                el.innerText.trim()
              );

              await browser.close();
              console.log("Advisory Title:", advisoryTitle);
              return { advisoryTitle: advisoryTitle };
            } catch (err) {
              console.error(
                `Failed to fetch Microsoft advisory for ${cveId}:`,
                err.message
              );
              await browser.close();
              return null;
            }
          }

          const result = await fetchMicrosoftAdvisoryTitle(cve?.cveId);
          if (result) {
            advisoryTitle = result.advisoryTitle;
            // Do something with advisoryTitle
          }
        }
        if (cve.vendorName == "Solarwinds") {
          // Fetch HTML content from the advisory URL
          advisoryUrl = `https://www.solarwinds.com/trust-center/security-advisories/${cve.cveId}`;
          const html = await rp(advisoryUrl);
          if (html) {
            const $ = cheerio.load(html);
            advisoryTitle = $("h1").text().trim();
            const fixedReleaseArray = $("h3")
              .filter((i, el) =>
                $(el).text().toLowerCase().includes("fixed software release")
              )
              .next("ul") // Navigate to the sibling <ul> element
              .find("li") // Find all <li> elements under the <ul>
              .map((i, el) => $(el).text().trim()) // Extract text content for each list item
              .get(); // Convert to an array

            // Convert the array to a string (comma-separated)
            fixedRelease = fixedReleaseArray.join(", ");
          }
        }
        if (cve.vendorName == "F5") {
          const puppeteer = require("puppeteer-extra");
          const StealthPlugin = require("puppeteer-extra-plugin-stealth");
          const cheerio = require("cheerio");

          puppeteer.use(StealthPlugin());

          const matchingUrls = cve?.cveDetails?.cve?.references.filter((ref) =>
            ref.url.includes("my.f5.com")
          );
          advisoryUrl =
            matchingUrls?.[0]?.url || cve?.cveDetails?.cve?.references[0]?.url;
          // Helper: Compare if version falls within a range

          async function fetchAdvisoryDetails(url) {
            let browser;

            try {
              browser = await puppeteer.launch({
                headless: "new",
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                ignoreHTTPSErrors: true,
                timeout: 120000,
              });

              const page = await browser.newPage();

              await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36"
              );

              await page.setExtraHTTPHeaders({
                "Accept-Language": "en-US,en;q=0.9",
              });

              console.log(`🌐 Navigating to: ${url}`);
              await page.goto(url, {
                waitUntil: "networkidle2",
                timeout: 120000,
              });

              await page.waitForSelector("h1", {
                visible: true,
                timeout: 60000,
              });

              const advisoryTitle = await page.$eval("h1", (el) =>
                el.innerText.trim()
              );

              const html = await page.content();
              const $ = cheerio.load(html);

              // 🛠 Extract workarounds
              let mitigationText = "";
              const mitigationHeading = $("*:contains('Mitigation')").filter(
                function () {
                  return $(this).text().trim() === "Mitigation";
                }
              );

              if (mitigationHeading.length > 0) {
                // Traverse to next siblings until another heading or section appears
                const mitigationContent = mitigationHeading
                  .parent()
                  .nextUntil("h2, h3, .some-other-section-class"); // adjust as per your DOM
                mitigationText = mitigationContent.text().trim();
              }

              workarounds = mitigationText;
              // console.log("cvv",cve.version)
              function normalizeVersion(version, length = 4) {
                if (typeof version !== "string")
                  version = String(version || "");
                const parts = version
                  .split(".")
                  .map((num) => parseInt(num, 10) || 0);
                while (parts.length < length) parts.push(0); // pad with zeros
                return parts;
              }

              // function normalizeVersion(version, length = 4) {
              //   const parts = version.split('.').map(num => parseInt(num, 10));
              //   while (parts.length < length) parts.push(0); // pad with zeros
              //   return parts;
              // }

              function semverCompare(a, b) {
                const pa = normalizeVersion(a);
                const pb = normalizeVersion(b);
                for (let i = 0; i < pa.length; i++) {
                  if (pa[i] > pb[i]) return 1;
                  if (pa[i] < pb[i]) return -1;
                }
                return 0;
              }

              function isVersionInRange(version, start, end) {
                const v = normalizeVersion(version);
                const s = normalizeVersion(start);
                const e = normalizeVersion(end);

                return semverCompare(v, s) >= 0 && semverCompare(v, e) <= 0;
              }
              const currentVersion = cve.version; // e.g., 16.1.3.3
              let lastProduct = "";
              let foundBigIpSection = false;

              $("table tbody tr").each((index, row) => {
                const tds = $(row).find("td");
                let product = tds.eq(0).text().trim();
                const branch = tds.eq(1).text().trim(); // This contains vulnerable version range
                const range = tds.eq(2).text().trim(); // This is actually the fixed version
                const fix = tds.eq(3).text().trim(); // This is mostly empty

                if (product) {
                  lastProduct = product;
                } else {
                  product = lastProduct;
                }

                // console.log(`➡️ Row ${index}: product=${product}, branch=${branch}, range=${range}, fix=${fix}`);

                // Check if we've entered the BIG-IP (all modules) section
                if (
                  product.includes("BIG-IP (all modules)") ||
                  product.includes("BIG-IP (all other modules)")
                ) {
                  foundBigIpSection = true;
                }

                // Now find the version line in that section
                if (foundBigIpSection && /^\d+\./.test(product)) {
                  const [minV, maxV] = branch.split("-").map((v) => v.trim());
                  if (
                    minV &&
                    maxV &&
                    isVersionInRange(currentVersion, minV, maxV)
                  ) {
                    fixedRelease = range || fix || "Not found";
                  }
                }
              });

              vulnerableComponent = "";
              let vulnerableComponentIndex = -1;
              let productColumnIndex = -1;

              // Step 1: Dynamically find index of 'Product' and 'Vulnerable component or feature'
              $("table tr").each((i, row) => {
                const cells = $(row).find("th, td");
                cells.each((index, cell) => {
                  const text = $(cell).text().trim().toLowerCase();
                  if (text === "product") productColumnIndex = index;
                  if (text === "vulnerable component or feature")
                    vulnerableComponentIndex = index;
                });
                if (
                  productColumnIndex !== -1 &&
                  vulnerableComponentIndex !== -1
                )
                  return false;
              });

              // Step 2: Loop through rows and extract value for relevant product
              if (
                productColumnIndex !== -1 &&
                vulnerableComponentIndex !== -1
              ) {
                $("table tr").each((index, row) => {
                  const cells = $(row).find("td");

                  if (
                    cells.length >
                    Math.max(productColumnIndex, vulnerableComponentIndex)
                  ) {
                    const productName = $(cells[productColumnIndex])
                      .text()
                      .trim()
                      .toLowerCase();
                    if (
                      productName === "big-ip (all modules)" ||
                      productName === "big-ip (all other modules)"
                    ) {
                      const vulnCell = $(cells[vulnerableComponentIndex])
                        .text()
                        .trim();
                      vulnerableComponent = vulnCell || "[Empty]";
                      console.log(
                        "✅ Match found. Vulnerable component:",
                        vulnerableComponent
                      );
                      return false; // Stop after finding the match
                    }
                  }
                });
              } else {
                console.warn("❌ Required headers not found");
              }

              console.log(
                "Final result =>",
                vulnerableComponent || "[Not found]"
              );
              console.log("fixedRelease =>", fixedRelease || "[Not found]");

              await browser.close();

              // console.log(`🔍 Advisory title: ${advisoryTitle}`);
              // console.log(`🛠️ Workarounds: ${workarounds || "Not found"}`);
              // console.log(`🔧 Fixed Release: ${fixedRelease}`);

              return {
                advisoryTitle: advisoryTitle || "Not found",
                workarounds: workarounds || "Not found",
                fixedRelease: fixedRelease || "Not found",
              };
            } catch (error) {
              if (browser) await browser.close();
              console.error(
                `❌ Error fetching advisory details: ${error.message}`
              );
              return {
                advisoryTitle: "Not found",
                workarounds: "Not found",
                fixedRelease: "Not found",
              };
            }
          }

          const result = await fetchAdvisoryDetails(advisoryUrl);
          advisoryTitle = result.advisoryTitle;
          workarounds = result.workarounds;
          fixedRelease = result.fixedRelease;
        }
        // else {
        //   const matchedUrls = cve?.cveDetails?.cve?.references;
        //    advisoryUrl = [
        //     ...new Map(
        //       matchedUrls
        //         .filter(item => !item.url.toLowerCase().endsWith('.pdf')) // Remove .pdfs
        //         .map(item => [item.url, item]) // Deduplicate
        //     ).values()
        //   ][0]?.url;

        //   console.log("dsdsd",advisoryUrl)
        // }

        await vendorProductCveModel.findByIdAndUpdate(cve._id, {
          advisoryTitle: advisoryTitle,
          fixedRelease: fixedRelease,
          advisoryUrl: advisoryUrl,
          workarounds: workarounds,
          vulnerableComponent: vulnerableComponent,
          vulnerableFeature: vulnerableFeature,
        });
        // }
      } catch (err) {
        console.error(`Error processing CVE ID (${cve._id}):`, err.message);
      }
    }

    response.send("Scheduler run successfully");
  } catch (error) {
    console.error("Error running scheduler:", error.message);
    response.status(500).send("Scheduler encountered an error");
  }
};

export default RunSecurityAdvisoryMappingScheduler;
