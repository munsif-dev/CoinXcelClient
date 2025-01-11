import React from "react";

const Footer = () => {
  return (
    <div className="w-full bg-[#1e1e2f] pt-11 pb-5 flex items-end justify-center">
      <div className="w-[1274px] h-[289px] relative">
        {/* Branding Section */}
        <div className="h-[180px] left-0 top-0 absolute">
          <div className="w-[357px] left-[1px] top-[60px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins'] leading-[30px]">
            Join the future of trading with us
          </div>
          <div className="left-[1px] top-0 absolute text-[#00d084] text-[50px] font-semibold font-['Poppins'] leading-[60px]">
            CoinXcel
          </div>
          <div className="w-[410px] h-[60px] left-0 top-[120px] absolute">
            <div className="w-[266px] left-[20px] top-[15px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins'] leading-[30px]">
              Enter your email
            </div>
            <div className="w-[410px] h-[60px] left-0 top-0 absolute rounded-[70px] border-2 border-[#b3b3b3]" />
            <div className="w-[46px] h-[46px] left-[357px] top-[7px] absolute bg-[#00d084] rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-white text-xl font-bold">→</span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="w-[594px] h-[205px] left-[669px] top-0 absolute">
          {/* Support Section */}
          <div className="w-[187px] h-[205px] left-0 top-0 absolute">
            <div className="left-0 top-0 absolute text-white text-lg font-medium font-['Poppins']">
              Support
            </div>
            <div className="left-0 top-[52px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins']">
              Help Center
            </div>
            <div className="left-0 top-[94px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins']">
              FAQs
            </div>
            <div className="left-0 top-[136px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins']">
              Contact Support
            </div>
          </div>
          {/* Resources Section */}
          <div className="w-40 h-[205px] left-[239px] top-0 absolute">
            <div className="left-0 top-0 absolute text-white text-lg font-medium font-['Poppins']">
              Resources
            </div>
            <div className="left-0 top-[52px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins']">
              Blog
            </div>
            <div className="left-0 top-[94px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins']">
              Trading Tips
            </div>
            <div className="left-0 top-[136px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins']">
              Market Insights
            </div>
          </div>
          {/* Company Section */}
          <div className="w-[139px] h-[205px] left-[455px] top-0 absolute">
            <div className="left-0 top-0 absolute text-white text-lg font-medium font-['Poppins']">
              Company
            </div>
            <div className="left-0 top-[52px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins']">
              About Us
            </div>
            <div className="left-0 top-[94px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins']">
              Careers
            </div>
            <div className="left-0 top-[136px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins']">
              Legal
            </div>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="w-[518px] left-[756px] top-[259px] absolute flex items-center space-x-4">
          <div className="text-white text-lg font-medium font-['Poppins']">
            Terms & Conditions
          </div>
          <div className="w-[6.26px] h-1 bg-[#b3b3b3] rounded-full" />
          <div className="text-white text-lg font-medium font-['Poppins']">
            Privacy Policy
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="left-[1px] top-[259px] absolute text-[#b3b3b3] text-lg font-medium font-['Poppins'] leading-[30px]">
          © 2025 CoinXcel Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;
