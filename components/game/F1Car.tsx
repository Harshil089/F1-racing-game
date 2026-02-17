'use client';

import React from 'react';

interface F1CarProps {
  color?: string;
  scale?: number;
  className?: string;
}

export default function F1Car({ color = '#e74c3c', scale = 1, className = '' }: F1CarProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        width: `${667 * scale}px`,
        height: `${330 * scale}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <div
        id="nose-top"
        style={{
          width: 0,
          height: 0,
          borderBottom: '21px solid',
          borderBottomColor: color,
          borderLeft: '0px solid transparent',
          borderRight: '200px solid transparent',
          position: 'absolute',
          top: '137px',
          left: '340px',
          zIndex: 3,
        }}
      />
      <div
        id="nose-bottom"
        style={{
          width: 0,
          height: 0,
          borderTop: '21px solid',
          borderTopColor: color,
          borderLeft: '0px solid transparent',
          borderRight: '200px solid transparent',
          position: 'absolute',
          top: '179px',
          left: '340px',
          zIndex: 3,
        }}
      />
      <div
        id="nose"
        style={{
          width: '400px',
          height: '25px',
          borderTopRightRadius: '50px',
          borderBottomRightRadius: '50px',
          position: 'absolute',
          top: '156px',
          left: '190px',
          zIndex: 2,
          background: color,
        }}
      />
      <div
        id="front-wing"
        style={{
          width: '22px',
          height: '166px',
          position: 'absolute',
          top: '86px',
          left: '539px',
          zIndex: 1,
          background: color,
        }}
      />
      <div
        id="top-front-wing-trim"
        style={{
          width: '14px',
          height: '6px',
          background: color,
          position: 'absolute',
          top: '124px',
          left: '554px',
          zIndex: 1,
        }}
      />
      <div
        id="bottom-front-wing-trim"
        style={{
          width: '14px',
          height: '6px',
          background: color,
          position: 'absolute',
          top: '207px',
          left: '554px',
          zIndex: 1,
        }}
      />
      <div
        id="top-front-wing-trim-2"
        style={{
          width: '14px',
          height: '25px',
          background: color,
          position: 'absolute',
          top: '92px',
          left: '554px',
          zIndex: 1,
        }}
      />
      <div
        id="bottom-front-wing-trim-2"
        style={{
          width: '14px',
          height: '25px',
          background: color,
          position: 'absolute',
          top: '220px',
          left: '554px',
          zIndex: 1,
        }}
      />
      <div
        id="top-front-wing"
        style={{
          width: 0,
          height: 0,
          borderRight: '30px solid',
          borderRightColor: color,
          borderTop: '0px solid transparent',
          borderBottom: '70px solid transparent',
          position: 'absolute',
          top: '86px',
          left: '515px',
          zIndex: 1,
        }}
      />
      <div
        id="top-front-wing-tail"
        style={{
          width: '49px',
          height: '20px',
          background: color,
          position: 'absolute',
          top: '86px',
          left: '512px',
        }}
      />
      <div
        id="bottom-front-wing"
        style={{
          width: 0,
          height: 0,
          borderRight: '30px solid',
          borderRightColor: color,
          borderBottom: '0px solid transparent',
          borderTop: '70px solid transparent',
          position: 'absolute',
          top: '182px',
          left: '515px',
          zIndex: 1,
        }}
      />
      <div
        id="bottom-front-wing-tail"
        style={{
          width: '49px',
          height: '20px',
          background: color,
          position: 'absolute',
          top: '232px',
          left: '512px',
        }}
      />
      <div
        id="bottom-front-wheel"
        className="wheel"
        style={{
          width: '60px',
          height: '35px',
          background: '#222',
          position: 'absolute',
          top: '219px',
          left: '437px',
          borderRadius: '8px',
          zIndex: 2,
        }}
      />
      <div
        id="bottom-back-wheel"
        style={{
          width: '60px',
          height: '35px',
          background: '#222',
          position: 'absolute',
          top: '219px',
          left: '120px',
          borderRadius: '8px',
          zIndex: 2,
        }}
      />
      <div
        id="top-front-wheel"
        className="wheel"
        style={{
          width: '60px',
          height: '35px',
          background: '#222',
          position: 'absolute',
          top: '83px',
          left: '437px',
          borderRadius: '8px',
          zIndex: 2,
        }}
      />
      <div
        id="top-back-wheel"
        style={{
          width: '60px',
          height: '35px',
          background: '#222',
          position: 'absolute',
          top: '83px',
          left: '120px',
          borderRadius: '8px',
          zIndex: 2,
        }}
      />
      <div
        id="rear-body"
        style={{
          width: '16px',
          height: '96px',
          background: color,
          position: 'absolute',
          top: '120px',
          left: '147px',
          zIndex: 2,
        }}
      />
      <div
        id="rear-wing-bg"
        style={{
          width: '53px',
          height: '84px',
          borderTop: `6px solid ${color}`,
          borderBottom: `6px solid ${color}`,
          background: '#ecf0f1',
          position: 'absolute',
          top: '120px',
          left: '103px',
          zIndex: 1,
        }}
      />
      <div
        id="rear-wing"
        style={{
          position: 'absolute',
        }}
      />
      <div
        id="top-body-curve"
        style={{
          width: '85px',
          height: '32px',
          background: color,
          borderRadius: '100px / 50px',
          position: 'absolute',
          top: '104px',
          left: '289px',
        }}
      />
      <div
        id="top-body-curve-cut"
        style={{
          width: 0,
          height: 0,
          borderLeft: '0px solid transparent',
          borderRight: '18px solid transparent',
          borderBottom: '50px solid',
          borderBottomColor: color,
          position: 'absolute',
          top: '113px',
          left: '372px',
        }}
      />
      <div
        id="top-body-curve-straight"
        style={{
          width: '100px',
          height: '30px',
          background: color,
          position: 'absolute',
          top: '116px',
          left: '207px',
          transform: 'rotate(-12deg)',
          zIndex: 2,
        }}
      />
      <div
        id="top-body-curve-straight-2"
        style={{
          width: '45px',
          height: '30px',
          background: color,
          position: 'absolute',
          top: '137px',
          left: '174px',
          transform: 'rotate(-36deg)',
          zIndex: 2,
        }}
      />
      <div
        id="bottom-body-curve"
        style={{
          width: '85px',
          height: '32px',
          background: color,
          borderRadius: '100px / 50px',
          position: 'absolute',
          top: '201px',
          left: '289px',
        }}
      />
      <div
        id="bottom-body-curve-cut"
        style={{
          width: 0,
          height: 0,
          borderLeft: '0px solid transparent',
          borderRight: '18px solid transparent',
          borderTop: '50px solid',
          borderTopColor: color,
          position: 'absolute',
          top: '174px',
          left: '372px',
        }}
      />
      <div
        id="bottom-body-curve-straight"
        style={{
          width: '100px',
          height: '30px',
          background: color,
          position: 'absolute',
          top: '191px',
          left: '207px',
          transform: 'rotate(12deg)',
          zIndex: 2,
        }}
      />
      <div
        id="bottom-body-curve-straight-2"
        style={{
          width: '45px',
          height: '30px',
          background: color,
          position: 'absolute',
          top: '171px',
          left: '174px',
          transform: 'rotate(36deg)',
          zIndex: 2,
        }}
      />
      <div
        id="back-body-curve"
        style={{
          width: '85px',
          height: '60px',
          background: color,
          borderRadius: '100px / 50px',
          position: 'absolute',
          top: '139px',
          left: '168px',
          zIndex: 1,
        }}
      />
      <div
        id="body-hood"
        style={{
          width: '134px',
          height: '93px',
          background: color,
          position: 'absolute',
          top: '123px',
          left: '240px',
          zIndex: 2,
        }}
      />
      <div
        id="back-body"
        style={{
          width: '85px',
          height: '94px',
          background: '#222',
          position: 'absolute',
          top: '122px',
          left: '148px',
          zIndex: 0,
        }}
      />
      <div
        id="back-body-top"
        style={{
          width: 0,
          height: 0,
          borderLeft: '20px solid transparent',
          borderRight: '0 solid transparent',
          borderBottom: '12px solid #222',
          zIndex: 0,
          position: 'absolute',
          top: '111px',
          left: '172px',
        }}
      />
      <div
        id="back-body-bottom"
        style={{
          width: 0,
          height: 0,
          borderLeft: '20px solid transparent',
          borderRight: '0 solid transparent',
          borderTop: '12px solid #222',
          zIndex: 0,
          position: 'absolute',
          top: '214px',
          left: '172px',
        }}
      />
      <div
        id="back-body-2"
        style={{
          width: '97px',
          height: '115px',
          background: '#222',
          position: 'absolute',
          top: '111px',
          left: '192px',
          zIndex: 0,
        }}
      />
      <div
        id="top-spoke-1"
        style={{
          width: '8px',
          height: '60px',
          background: '#777',
          zIndex: 0,
          position: 'absolute',
          top: '96px',
          left: '465px',
          transform: 'rotate(-9deg)',
        }}
      />
      <div
        id="top-spoke-2"
        style={{
          width: '8px',
          height: '60px',
          background: '#777',
          zIndex: 0,
          position: 'absolute',
          top: '105px',
          left: '475px',
          transform: 'rotate(-25deg)',
        }}
      />
      <div
        id="top-spoke-3"
        style={{
          width: '5px',
          height: '60px',
          background: '#777',
          zIndex: 0,
          position: 'absolute',
          top: '105px',
          left: '457px',
          transform: 'rotate(23deg)',
        }}
      />
      <div
        id="top-spoke-4"
        style={{
          width: '8px',
          height: '60px',
          background: '#777',
          zIndex: 0,
          position: 'absolute',
          top: '105px',
          left: '445px',
          transform: 'rotate(36deg)',
        }}
      />
      <div
        id="bottom-spoke-1"
        style={{
          width: '8px',
          height: '60px',
          background: '#777',
          zIndex: 0,
          position: 'absolute',
          top: '172px',
          left: '465px',
          transform: 'rotate(9deg)',
        }}
      />
      <div
        id="bottom-spoke-2"
        style={{
          width: '8px',
          height: '60px',
          background: '#777',
          zIndex: 0,
          position: 'absolute',
          top: '172px',
          left: '475px',
          transform: 'rotate(25deg)',
        }}
      />
      <div
        id="bottom-spoke-3"
        style={{
          width: '5px',
          height: '60px',
          background: '#777',
          zIndex: 0,
          position: 'absolute',
          top: '172px',
          left: '457px',
          transform: 'rotate(-23deg)',
        }}
      />
      <div
        id="bottom-spoke-4"
        style={{
          width: '8px',
          height: '60px',
          background: '#777',
          zIndex: 0,
          position: 'absolute',
          top: '172px',
          left: '445px',
          transform: 'rotate(-36deg)',
        }}
      />
      <div
        id="back-spoke"
        style={{
          width: '18px',
          height: '160px',
          background: '#777',
          zIndex: 0,
          position: 'absolute',
          top: '92px',
          left: '141px',
        }}
      />
      <div
        id="mirror-top"
        style={{
          background: color,
          width: '13px',
          height: '23px',
          position: 'absolute',
          top: '122px',
          left: '385px',
          zIndex: 5,
          borderRadius: '0 90px 90px 0',
        }}
      />
      <div
        id="mirror-bottom"
        style={{
          background: color,
          width: '13px',
          height: '23px',
          position: 'absolute',
          top: '191px',
          left: '385px',
          zIndex: 5,
          borderRadius: '0 90px 90px 0',
        }}
      />
      <div
        id="driver-bg"
        style={{
          width: '68px',
          height: '29px',
          background: '#222',
          position: 'absolute',
          top: '155px',
          left: '331px',
          zIndex: 5,
          borderRadius: '5px',
        }}
      />
      <div
        id="driver-wheel"
        style={{
          width: '5px',
          height: '25px',
          background: '#95a5a6',
          position: 'absolute',
          top: '157px',
          left: '391px',
          zIndex: 5,
          borderRadius: '5px',
        }}
      />
      <div
        id="driver-helmet"
        style={{
          background: '#3498db',
          width: '27px',
          height: '25px',
          position: 'absolute',
          top: '157px',
          left: '332px',
          zIndex: 6,
          borderRadius: '20px 50px 50px 20px',
        }}
      />
      <div
        id="bottom-body-spine"
        style={{
          background: '#c0392b',
          width: '80px',
          height: '5px',
          position: 'absolute',
          top: '197px',
          left: '300px',
          zIndex: 4,
          opacity: 0.2,
        }}
      />
      <div
        id="top-body-spine"
        style={{
          background: '#c0392b',
          width: '80px',
          height: '5px',
          position: 'absolute',
          top: '135px',
          left: '300px',
          zIndex: 4,
          opacity: 0.2,
        }}
      />
      <div
        id="end-body-spine"
        style={{
          width: '80px',
          height: '30px',
          position: 'absolute',
          top: '153px',
          left: '180px',
          zIndex: 4,
          borderRadius: '50px 0px 0px 50px',
          borderLeft: '6px solid #c0392b',
          opacity: 0.2,
        }}
      />
      <div
        id="top-body-spine-2"
        style={{
          background: '#c0392b',
          width: '115px',
          height: '5px',
          position: 'absolute',
          top: '145px',
          left: '186px',
          zIndex: 4,
          transform: 'rotate(-10deg)',
          opacity: 0.2,
        }}
      />
      <div
        id="bottom-body-spine-2"
        style={{
          background: '#c0392b',
          width: '115px',
          height: '5px',
          position: 'absolute',
          top: '187px',
          left: '186px',
          zIndex: 4,
          transform: 'rotate(10deg)',
          opacity: 0.2,
        }}
      />
    </div>
  );
}
