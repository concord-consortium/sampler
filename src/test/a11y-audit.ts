const fs = require('fs');
const path = require('path');

/**
 * Runs a basic accessibility audit on HTML files
 * and generates a report of potential issues
 */
async function runA11yAudit() {
  console.log('Running basic accessibility audit on HTML files...');
  
  try {
    // Read the HTML file
    const htmlFilePath = path.resolve(__dirname, '../../src/index.html');
    const html = fs.readFileSync(htmlFilePath, 'utf8');
    
    // Initialize results object
    const results = {
      missingAltAttributes: [],
      emptyAltAttributes: [],
      missingFormLabels: [],
      missingDocumentLanguage: false,
      missingPageTitle: false,
      emptyLinks: [],
      missingButtonText: [],
      missingAriaRoles: []
    };
    
    // Check for missing alt attributes on images
    const imgRegex = /<img(?![^>]*alt=)[^>]*>/g;
    const missingAltMatches = html.match(imgRegex) || [];
    results.missingAltAttributes = missingAltMatches;
    
    // Check for empty alt attributes
    const emptyAltRegex = /<img[^>]*alt=["'][^"']*["'][^>]*>/g;
    const imgTags = html.match(emptyAltRegex) || [];
    results.emptyAltAttributes = imgTags.filter((tag: string) => tag.match(/alt=["']["']/));
    
    // Check for missing form labels
    const inputRegex = /<input(?![^>]*aria-label)(?![^>]*aria-labelledby)[^>]*>/g;
    const missingLabelMatches = html.match(inputRegex) || [];
    results.missingFormLabels = missingLabelMatches;
    
    // Check for missing document language
    results.missingDocumentLanguage = !html.match(/<html[^>]*lang=["'][^"']*["']/);
    
    // Check for missing page title
    results.missingPageTitle = !html.match(/<title>[^<]*<\/title>/);
    
    // Check for empty links
    const emptyLinkRegex = /<a[^>]*>(\s*|&nbsp;|<img[^>]*alt=["']["'][^>]*>)<\/a>/g;
    const emptyLinkMatches = html.match(emptyLinkRegex) || [];
    results.emptyLinks = emptyLinkMatches;
    
    // Check for missing button text
    const emptyButtonRegex = /<button[^>]*>(\s*|&nbsp;)<\/button>/g;
    const emptyButtonMatches = html.match(emptyButtonRegex) || [];
    results.missingButtonText = emptyButtonMatches;
    
    // Check for missing ARIA roles on interactive elements
    const missingRoleRegex = /<(div|span)(?![^>]*role=)[^>]*tabindex=["']0["'][^>]*>/g;
    const missingRoleMatches = html.match(missingRoleRegex) || [];
    results.missingAriaRoles = missingRoleMatches;
    
    // Log results
    console.log('\nAccessibility Audit Results:');
    console.log('---------------------------');
    console.log(`Missing alt attributes: ${results.missingAltAttributes.length}`);
    console.log(`Empty alt attributes: ${results.emptyAltAttributes.length}`);
    console.log(`Missing form labels: ${results.missingFormLabels.length}`);
    console.log(`Missing document language: ${results.missingDocumentLanguage}`);
    console.log(`Missing page title: ${results.missingPageTitle}`);
    console.log(`Empty links: ${results.emptyLinks.length}`);
    console.log(`Missing button text: ${results.missingButtonText.length}`);
    console.log(`Missing ARIA roles: ${results.missingAriaRoles.length}`);
    
    // Create reports directory if it doesn't exist
    const reportsDir = path.resolve(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Write results to a JSON file
    const reportPath = path.resolve(reportsDir, 'a11y-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\nDetailed report written to: ${reportPath}`);
    
  } catch (error) {
    console.error('Error running accessibility audit:', error);
  }
}

// Run the audit if this file is executed directly
if (require.main === module) {
  runA11yAudit().catch(error => {
    console.error('Error running accessibility audit:', error);
    process.exit(1);
  });
}

module.exports = { runA11yAudit }; 