const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

// Middleware
app.use(bodyParser.json());

async function fetchPhysicianData(name) {
    const apiUrl = `https://npiregistry.cms.hhs.gov/api/?version=2.1&first_name=${encodeURIComponent(name.split(' ')[0])}&last_name=${encodeURIComponent(name.split(' ')[1])}&limit=10`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.results && response.data.results.length > 0) {
            const physicians = await Promise.all(response.data.results.map(async (physician) => {
                const additionalData = await fetchAdditionalData(physician.number);
                return {
                    name: `${physician.basic.first_name} ${physician.basic.last_name}`,
                    npi: physician.number,
                    credentials: physician.basic.credential,
                    address: `${physician.addresses[0].address_1}, ${physician.addresses[0].city}, ${physician.addresses[0].state} ${physician.addresses[0].postal_code}`,
                    state_licenses: await fetchLicenseStatuses(physician.taxonomies),
                    ...additionalData,
                    backgroundCheck: performBackgroundCheck(physician, additionalData)
                };
            }));
            return {
                found: true,
                physicians: physicians
            };
        } else {
            return {
                found: false,
                name: name,
                message: 'No matching physician found.'
            };
        }
    } catch (error) {
        return {
            found: false,
            name: name,
            message: 'Error fetching data from NPPES API.'
        };
    }
}

async function fetchAdditionalData(npi) {
    // Mock implementation. Replace with actual API calls.
    const education = await fetchEducation(npi);
    const residency = await fetchResidency(npi);
    const affiliations = await fetchAffiliations(npi);
    const cme = await fetchCME(npi);
    const ratings = await fetchRatings(npi);
    const publications = await fetchPublications(npi);
    const employmentHistory = await fetchEmploymentHistory(npi);
    const languages = await fetchLanguages(npi);
    const skills = await fetchSkills(npi);
    const hospitalPrivileges = await fetchHospitalPrivileges(npi);

    return {
        education,
        residency,
        affiliations,
        cme,
        ratings,
        publications,
        employmentHistory,
        languages,
        skills,
        hospitalPrivileges
    };
}

async function fetchEducation(npi) {
    // Mock API call for education
    return 'Medical School - XYZ University';
}

async function fetchResidency(npi) {
    // Mock API call for residency
    return 'Residency - ABC Hospital';
}

async function fetchAffiliations(npi) {
    // Mock API call for professional affiliations
    return 'American Medical Association (AMA), American Osteopathic Association (AOA)';
}

async function fetchCME(npi) {
    // Mock API call for continuing medical education
    return '30 CME credits completed in the last year (January 2023 - December 2023)';
}

async function fetchRatings(npi) {
    // Mock API call for ratings
    return '4.8/5 from 120 reviews';
}

async function fetchPublications(npi) {
    // Mock API call for publications
    return '10 research papers published';
}

async function fetchEmploymentHistory(npi) {
    // Mock API call for employment history
    return 'Current: DEF Hospital, Previous: GHI Clinic';
}

async function fetchLanguages(npi) {
    // Mock API call for languages spoken
    return 'English, Spanish';
}

async function fetchSkills(npi) {
    // Mock API call for special skills or certifications
    return 'ACLS, BLS certified';
}

async function fetchHospitalPrivileges(npi) {
    // Mock API call for hospital privileges
    return 'ABC Hospital, XYZ Clinic';
}

async function fetchLicenseStatuses(taxonomies) {
    // Mock API call for license statuses
    return await Promise.all(taxonomies.map(async (taxonomy) => {
        // Replace with actual API call to fetch license status
        const status = await fetchLicenseStatus(taxonomy.state, taxonomy.license);
        return {
            state: taxonomy.state,
            license: taxonomy.license,
            status: status
        };
    }));
}

async function fetchLicenseStatus(state, license) {
    // Mock API call for license status
    return 'Active'; // Replace with actual license status from the API
}

function performBackgroundCheck(physician, additionalData) {
    // Mock background check results
    return {
        passed: true,
        details: {
            education: additionalData.education,
            residency: additionalData.residency,
            affiliations: additionalData.affiliations,
            cme: additionalData.cme,
            ratings: additionalData.ratings,
            publications: additionalData.publications,
            employmentHistory: additionalData.employmentHistory,
            languages: additionalData.languages,
            skills: additionalData.skills,
            hospitalPrivileges: additionalData.hospitalPrivileges,
            criminalCheck: 'No records found',
            malpracticeHistory: 'No cases found',
            sanctions: 'No actions found',
            deaRegistration: 'Valid',
            continuousMonitoring: 'No new alerts'
        }
    };
}

app.post('/api/screen', async (req, res) => {
    const { name } = req.body;
    const result = await fetchPhysicianData(name);
    res.json(result);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

module.exports = app;
