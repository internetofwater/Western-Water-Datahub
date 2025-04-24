import { EDRService } from '@/services/edr.service';

const edrService = new EDRService({
    baseUrl: 'https://api.wwdh.internetofwater.app/',
});

export default edrService;
