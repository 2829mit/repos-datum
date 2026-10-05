export interface ReposRepresentative {
  email: string;
  name: string;
}

export const DEFAULT_REPOS_PASSWORD = 'Repos@123';

export const REPOS_REPRESENTATIVES: ReposRepresentative[] = [
  { email: 'charudatta.deshpande@reposenergy.com', name: 'Charudatta Sunil Deshpande' },
  { email: 'akash.sriram@reposenergy.com', name: 'K Akash Sriram' },
  { email: 'bhavin.sutariya@reposenergy.com', name: 'Bhavin Sutariya' },
  { email: 'siddhi.saungar@reposenergy.com', name: 'Siddhi Kailash Saungar' },
  { email: 'sumita.sharma@reposenergy.com', name: 'Sumita Sharma' },
  { email: 'Chinmay.Aradhya@reposenergy.com', name: 'Chinmay S Aradhya' },
  { email: 'chirag.patil@reposenergy.com', name: 'Chirag Kishor Patil' },
  { email: 'sachin.varrier@reposenergy.com', name: 'Sachin Varrier' },
  { email: 'abhishek.p@reposenergy.com', name: 'Abhishek P' },
  { email: 'niketan.sharma@reposenergy.com', name: 'Niketan Sharma' },
  { email: 'shreyank.vp@reposenergy.com', name: 'Shreyank VP' },
  { email: 'amaresh.hiremath@reposenergy.com', name: 'Amaresh Hiremath' },
  { email: 'dipam.tiwari@reposenergy.com', name: 'Dipam Lalitkumar Tiwari' },
  { email: 'shreen.sharma@reposenergy.com', name: 'Shreen Sharma' },
  { email: 'kaveri.gore@reposenergy.com', name: 'Kaveri Appasaheb Gore' },
  { email: 'ketan.sarode@reposenergy.com', name: 'Ketan Pradeep Sarode' },
  { email: 'dhanush.adhithya@reposenergy.com', name: 'Dhanush Adhithya M' },
  { email: 'Prathamesh.Rajebhosale@reposenergy.com', name: 'Prathamesh Ghanshyam Rajebhosale' },
  { email: 'dhimanth.ks@reposenergy.com', name: 'Dhimanth KS' },
  { email: 'Navya.Kalakaturu@reposenergy.com', name: 'Kalakaturu Navya Sree' },
  { email: 'kishore.g@reposenergy.com', name: 'Kishore G' },
  { email: 'vineeth.kotturi@reposenergy.com', name: 'Kotturi Vineeth Kumar' },
  { email: 'prahladkumar.patel@reposenergy.com', name: 'Prahladkumar Patel' },
  { email: 'anurag.kolumpurath@reposenergy.com', name: 'Anurag Ramakrishnan Kolumpurath' },
  { email: 'premranjan.pandey@reposenergy.com', name: 'Prem Ranjan Pandey' },
  { email: 'yaddanapudi.pradeep@reposenergy.com', name: 'Yaddanapudi Pradeep' },
  { email: 'yash.laheja@reposenergy.com', name: 'Yash Laheja' },
  { email: 'naveen.n.kodal@reposenergy.com', name: 'Naveen Kodal' },
  { email: 'mevawala.yash@reposenergy.com', name: 'Mevawala Yash Chintan' },
  { email: 'jaisurya.sankar@reposenergy.com', name: 'Jaisurya Sankar' },
  { email: 'mandla.saikrishna@reposenergy.com', name: 'Mandla Sai Krishna' },
  { email: 'gaurav.saindane@reposenergy.com', name: 'Gaurav Hiralal Saindane' },
  { email: 'meshack.lavis@reposenergy.com', name: 'Meshack Hella Lavis' },
  { email: 'piyush.patil@reposenergy.com', name: 'Piyush Prakash Patil' },
  { email: 'asif.shaikh@reposenergy.com', name: 'Asif Samad Shaikh' },
  { email: 'swapnil.thakur@reposenergy.com', name: 'Swapnil Thakur' },
  { email: 'greeshma.sajeev@reposenergy.com', name: 'Greeshma Sajeev' },
  { email: 'riddhi.pardeshi@reposenergy.com', name: 'Riddhi Girish Pardeshi' },
  { email: 'rishabh.kumar@reposenergy.com', name: 'Rishabh A Kumar' },
  { email: 'abhishek.potdar@reposenergy.com', name: 'Abhishek Manikprabhu Potdar' },
  { email: 'shamanth.gowda@reposenergy.com', name: 'Shamanth Gowda S' },
  { email: 'ajay@reposenergy.com', name: 'Ajay Kumar' },
  { email: 'muralidharan.b@reposenergy.com', name: 'Muralidharan B' },
  { email: 'yash.barne2@reposenergy.com', name: 'Yash Shantaram Barne' },
  { email: 'prachiti.khandekar@reposenergy.com', name: 'Prachiti Sudhanwa Khandekar' },
  { email: 'akhil.raj@reposenergy.com', name: 'Akhil Raj' },
  { email: 'gagan.chandra@reposenergy.com', name: 'Masabathini Gagan Sai Chandra Bose' },
  { email: 'siddhesh.patil@reposenergy.com', name: 'Siddhesh Ratnakant Patil' },
  { email: 'sanket.chavan@reposenergy.com', name: 'Sanket Bharat Chavan' }
];

export const findRepresentativeByEmail = (email: string): ReposRepresentative | undefined => {
  const normalized = email.trim().toLowerCase();
  return REPOS_REPRESENTATIVES.find(r => r.email.toLowerCase() === normalized);
};

export const findRepresentativeByName = (name: string): ReposRepresentative | undefined => {
  const normalized = name.trim().toLowerCase();
  return REPOS_REPRESENTATIVES.find(r => r.name.toLowerCase() === normalized);
};
