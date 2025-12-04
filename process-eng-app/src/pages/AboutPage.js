import React from 'react';
import { webFrontendVersion } from '../version';

function AboutPage() {


  return (
    <div>
        <h2>About Calibrix</h2>
        <p>
            <strong>Calibrix Version:</strong> {webFrontendVersion}
        </p>

        <p>
            This tool provides calibration and engineering workflows for production environments.
        </p>
    </div>

  );
}

export default AboutPage;
