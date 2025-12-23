import React from 'react';
import { webFrontendVersion } from '../version';
import constants from '../constants';

function AboutPage() {

  const onDownloadOperatorAppWindows = () => {
    console.log('Start downloading OperatorApp for Windows...');
  
    fetch(`${constants.API_BASE}/general/download-operator-app-win`, {
      method: 'GET',
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log(
          'Got OperatorApp for Windows download setup from server:',
          data
        );
  
        //Create a temporary <a> to trigger download
        const link = document.createElement('a');
        link.href = data.url;
        link.download = data.fileName; // browser hint (works for same-origin or allowed CORS)
        link.style.display = 'none';
  
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => {
        console.error('Failed to download OperatorApp for Windows:', err);
        alert('Failed to download OperatorApp for Windows');
      });
  };
  

  const onDownloadOperatorAppMacOS = () => {
    let msg = 'OperatorApp for MacOS is coming soon!\n\n';
    console.log(msg);
    alert(msg);
  };

  const onDownloadOperatorAppLinux = () => {
    let msg = 'OperatorApp for Linux is coming soon!\n\n';
    console.log(msg);
    alert(msg);
  };

  return (
    <div>
        <h2>About Calibrix</h2>
        <p>
            <strong>Calibrix Version:</strong> {webFrontendVersion}
        </p>

        <p>
            This tool provides calibration and engineering workflows for production environments.
        </p>

        <div className="d-grid gap-3" style={{ maxWidth: '300px' }}>
        <label className="form-label">Download Operator application:</label>
        <div>
          <label className="form-label">Windows</label>
          <button className="btn btn-primary w-100" onClick={onDownloadOperatorAppWindows}>
            Download Operator application for Windows
          </button>
        </div>

        <div>
          <label className="form-label">MacOS</label>
          <button className="btn btn-primary w-100" onClick={onDownloadOperatorAppMacOS}>
          Download Operator application for MacOS
          </button>
        </div>

        <div>
          <label className="form-label">Linux</label>
          <button className="btn btn-primary w-100" onClick={onDownloadOperatorAppLinux} >
          Download Operator application for Linux
          </button>
        </div>
      </div>

    </div>

  );
}

export default AboutPage;
